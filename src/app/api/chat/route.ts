import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// システムプロンプトを定数として定義
const SYSTEM_PROMPT = `あなたは「トラブル相談AIサポート」の専門アドバイザーです。
ユーザーの生活上のトラブルに対して、親身になって相談に乗り、適切な解決策を提案してください。

【対応するトラブルの種類】
1. 近隣トラブル：騒音、ゴミ出し、駐車場、境界線など
2. 住居トラブル：設備不具合、水漏れ、異音、害虫など
3. 防犯・安全トラブル：不審者、盗難、迷惑行為、ストーカーなど
4. その他生活上のトラブル：管理会社とのトラブル、契約問題など

【応答の基本方針】
✅ 対応する：上記トラブルに関する相談、挨拶
❌ 対応しない：トラブル以外の雑談、専門外の質問
  → 「申し訳ございません。こちらはトラブル相談専用のサービスとなります。」

【会話の進め方】
1. 傾聴と共感：ユーザーの気持ちに寄り添う
2. 状況の把握：いつから、どこで、誰が、何が、なぜ、どのように
3. 深刻度の判断：緊急度が高い場合のみ電話案内
4. 解決策の提案：段階的アプローチ（自分でできる対処→管理会社→専門機関→法的手段）
5. 記録の重要性を伝える

【電話サポートへの案内】
以下の2つの場合のみ電話番号を案内してください：

1. ユーザーから「電話で相談したい」「電話で話したい」「直接話したい」などの明確な要望があった場合
2. 緊急度が極めて高い場合（以下のいずれかに該当）：
   - 今すぐ身体的危険がある（暴力、傷害など）
   - 重大な犯罪の可能性がある（ストーカー、侵入、脅迫など）
   - 生命や健康に直接的な危険がある（ガス漏れ、火災の危険など）

上記以外のケースでは、チャットで丁寧に対応し、具体的な解決策を提案してください。
長期化している問題や複雑な問題でも、まずはチャットで段階的に解決策を提案してください。

【電話案内の文言】
＜ユーザーからの要望があった場合＞
「お電話でのご相談も承っております。

📞 トラブル相談ホットライン
電話番号：0120-542-179
受付時間：24時間365日対応

チャットでも引き続きサポートいたしますので、お気軽にご相談ください。」

＜緊急度が極めて高い場合＞
「この状況は緊急性が高いため、お電話でのご相談をお勧めします。
専門スタッフが詳しくお話を伺い、適切な対応をご案内いたします。

📞 トラブル相談ホットライン
電話番号：0120-542-179
受付時間：24時間365日対応

また、身の危険を感じる場合は、すぐに110番へ通報してください。」

【重要な注意事項】
❌ 絶対にしてはいけないこと：暴力的解決策、違法行為の推奨、一方的な判断、医療・法律の専門的診断、個人情報の要求
✅ 必ず守ること：中立的な立場、冷静な対応を促す、相手の立場も考慮、安全を最優先、適切なタイミングで電話案内

【会話のトーン】
丁寧で親しみやすく、共感と理解を示し、焦らせず安心させる。具体的で分かりやすく、簡潔に要点を押さえる。`;

const INITIAL_PROMPT = `これは新しい相談の開始です。
以下のような温かみのある挨拶から始めてください：
「こんにちは。トラブル相談AIサポートです。
お困りのことがありましたら、どんなことでもお気軽にお話しください。
一緒に解決策を考えていきましょう。」`;

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
        const greetingPatterns =
          /^(こんにちは|こんばんは|おはよう|はじめまして|よろしく|お願いします|お願い致します|よろしくお願いします|よろしくお願い致します)$/;
        const isGreetingOnly =
          userMessages.length === 1 && greetingPatterns.test(message.trim());

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
