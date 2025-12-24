import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// システムプロンプトを定数として定義
const SYSTEM_PROMPT = `あなたはトラブル相談専門のアドバイザーです。
以下のような生活上のトラブル相談に対応してください。

1. 対応するトラブルの種類：
- 近隣トラブル（騒音、ゴミ出し、駐車場など）
- 住居トラブル（設備の不具合、水漏れ、異音など）
- 防犯トラブル（不審者、盗難、迷惑行為など）
- その他生活上のトラブル全般

2. 応答範囲：
- 挨拶への返答
- 上記トラブルに関する相談への対応
- それ以外の質問には「申し訳ありませんが、トラブルに関する相談以外はお答えできません」と回答

3. 会話の基本：
- 相手の発言をよく理解し、適切に応答
- 必要な情報は丁寧に質問
- 具体的な解決策を提案
- 深刻な場合や解決が難しい場合は、以下の電話番号を案内：
  「お電話でのご相談も承っております。トラブル相談ホットライン：0120-XXX-XXX（24時間対応）」

4. トラブル対応の手順：
- 状況の詳細を確認（いつから、どのような状況か）
- 問題の深刻度を判断
- 具体的な対処方法を提案
  1. 当事者間での解決方法
  2. 管理会社や自治会への相談
  3. 警察や専門機関への相談
- 必要に応じて記録の取り方なども説明

5. 重要な注意点：
- 暴力的な解決策は絶対に提案しない
- 違法な行為は推奨しない
- 相手の立場も考慮した冷静な対応を促す
- 必要に応じて法的手段の検討も提案
- チャットでの解決が難しい場合は、必ず電話番号を案内する`;

const INITIAL_PROMPT = `これは新しい相談の開始です。
以下のような簡潔な挨拶から始めてください：
「こんにちは。トラブルのご相談がありましたら、お気軽にお話しください。」`;

// OpenAIクライアントの設定
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GPT_MODEL = "gpt-4.1-nano-2025-04-14";

let openai: OpenAI | null = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

// 応答テキストを整形する関数
function formatAssistantMessage(text: string): string {
  return text
    .split("。")
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .join("。\n");
}

export async function POST(request: NextRequest) {
  try {
    console.log("\n=== Chat Prisma API Start ===");
    const token = await getToken({ req: request });
    if (!token) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User ID:", token.id);

    const { message, chatRoomId } = await request.json();
    console.log("Request data:", { message, chatRoomId });

    if (!message) {
      console.log("Missing message");
      return NextResponse.json(
        { success: false, error: "メッセージは必須です" },
        { status: 400 }
      );
    }

    // トランザクションでチャットルームとメッセージを保存（タイムアウト30秒）
    const result = await prisma.$transaction(
      async (tx) => {
        // チャットルームの取得または作成
        let chatRoom;
        if (chatRoomId) {
          chatRoom = await tx.chatRoom.findUnique({
            where: {
              id: chatRoomId,
              user_id: parseInt(token.id, 10),
            },
          });

          if (!chatRoom) {
            throw new Error("Chat room not found or unauthorized");
          }
        } else {
          chatRoom = await tx.chatRoom.create({
            data: {
              user_id: parseInt(token.id, 10),
            },
          });
        }

        // ユーザーメッセージを保存
        const userMessage = await tx.message.create({
          data: {
            chat_room_id: chatRoom.id,
            sender: "user",
            body: message,
          },
        });

        // チャット履歴を取得
        const history = await tx.message.findMany({
          where: {
            chat_room_id: chatRoom.id,
          },
          orderBy: {
            created_at: "asc",
          },
        });

        // OpenAI APIの呼び出し
        if (!openai || !OPENAI_API_KEY) {
          throw new Error(
            "OpenAI APIの設定が正しくありません。環境変数 OPENAI_API_KEY を確認してください。"
          );
        }

        const messages: ChatCompletionMessageParam[] = history.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.body,
        }));

        // システムメッセージを追加
        messages.unshift(
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "system",
            content: history.length <= 1 ? INITIAL_PROMPT : "",
          }
        );

        const completion = await openai.chat.completions.create({
          model: GPT_MODEL,
          messages,
          temperature: 0.3,
          max_tokens: 1000,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
        });

        const assistantMessage = formatAssistantMessage(
          completion.choices[0].message.content ??
            "申し訳ございません。応答の生成に失敗しました。"
        );

        // アシスタントの応答を保存
        const savedAssistantMessage = await tx.message.create({
          data: {
            chat_room_id: chatRoom.id,
            sender: "assistant",
            body: assistantMessage,
          },
        });

        // タイトル自動生成（タイトルがない場合、かつ具体的な相談内容が含まれる場合）
        const userMessages = history.filter((m) => m.sender === "user");
        const shouldGenerateTitle = !chatRoom.title && userMessages.length >= 1;
        
        // 挨拶だけの場合はタイトル生成しない
        const greetingPatterns = /^(こんにちは|こんばんは|おはよう|はじめまして|よろしく|お願いします|お願い致します|よろしくお願いします|よろしくお願い致します)$/;
        const isGreetingOnly = userMessages.length === 1 && greetingPatterns.test(message.trim());

        if (shouldGenerateTitle && !isGreetingOnly) {
          try {
            // 1件目の場合は現在のメッセージ、2件目以降は1件目と2件目を組み合わせる
            let contentForTitle = message;
            if (userMessages.length >= 2) {
              // 1件目と2件目のメッセージを結合（より正確なタイトルを生成）
              const firstMessage = userMessages[0].body;
              const secondMessage = userMessages[1].body;
              contentForTitle = `${firstMessage}\n${secondMessage}`;
            }

            const titleCompletion = await openai.chat.completions.create({
              model: GPT_MODEL,
              messages: [
                {
                  role: "system",
                  content:
                    "以下のトラブル相談の内容を10文字以内の簡潔なタイトルにまとめてください。「〜について」「〜の件」などの形式で。",
                },
                {
                  role: "user",
                  content: contentForTitle,
                },
              ],
              temperature: 0.3,
              max_tokens: 30,
            });

            const generatedTitle =
              titleCompletion.choices[0].message.content?.trim() || null;

            if (generatedTitle) {
              const updatedRoom = await tx.chatRoom.update({
                where: { id: chatRoom.id },
                data: { title: generatedTitle.substring(0, 100) },
              });
              chatRoom = updatedRoom;
            }
          } catch (titleError) {
            console.error("Error generating title:", titleError);
            // タイトル生成に失敗してもチャット自体は続行
          }
        }

        return {
          message: assistantMessage,
          chatRoomId: chatRoom.id,
          title: chatRoom.title,
        };
      },
      {
        timeout: 30000, // 30秒
      }
    );

    console.log("Chat completed successfully");
    console.log("=== Chat Prisma API End ===");

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "予期せぬエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
