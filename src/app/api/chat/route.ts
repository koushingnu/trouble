import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { Message } from "@/types/chat";
import { ChatCompletionMessageParam } from "openai/resources/chat";

// 定数定義
const API_PHP_URL =
  process.env.NEXT_PUBLIC_API_BASE || "https://ttsv.sakura.ne.jp/api.php";
const OPENAI_API_KEY = process.env.OPEN_API_KEY; // 環境変数名を修正
const GPT_MODEL = "gpt-4.1-nano-2025-04-14"; // より高性能なモデルに変更

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
- それ以外の質問（天気予報、計算、一般的な雑談など）には「申し訳ありませんが、トラブルに関する相談以外はお答えできません」と回答

3. 会話の基本：
- 相手の発言をよく理解し、適切に応答
- 必要な情報は丁寧に質問
- 具体的な解決策を提案
- 深刻な場合は、専門家や関係機関への相談を推奨

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
- 必要に応じて法的手段の検討も提案`;

const INITIAL_PROMPT = `これは新しい相談の開始です。
以下のような簡潔な挨拶から始めてください：
「こんにちは。トラブルのご相談がありましたら、お気軽にお話しください。」`;

// 応答テキストを整形する関数
function formatAssistantMessage(text: string): string {
  return text
    .split("。")
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .join("。\n");
}

// OpenAIクライアントの設定
let openai: OpenAI | null = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

// チャット履歴をOpenAIのメッセージ形式に変換
function convertHistoryToMessages(
  messages: Message[]
): ChatCompletionMessageParam[] {
  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content: SYSTEM_PROMPT,
  };

  // 初回メッセージかどうかを判断
  const isInitialMessage = messages.length <= 1;

  // 会話の要点をまとめる
  let conversationSummary = "";
  let currentTopic = "";
  let lastUserMessage = "";

  for (const msg of messages) {
    if (msg.sender === "user") {
      lastUserMessage = msg.body;
      if (msg.body.trim().length > 0) {
        conversationSummary += `ユーザー: ${msg.body}\n`;
      }
    } else {
      if (msg.body.trim().length > 0) {
        conversationSummary += `アシスタント: ${msg.body}\n`;
      }
    }

    // 話題を特定
    const content = msg.body.toLowerCase();
    if (content.includes("エアコン")) currentTopic = "エアコンの問題";
    // 他の話題のパターンも必要に応じて追加
  }

  // 文脈サマリーを作成
  const contextSummary = isInitialMessage
    ? INITIAL_PROMPT
    : `
現在の会話状況：
- 話題: ${currentTopic || "未特定"}
- 最後のユーザー発言: ${lastUserMessage}

これまでの会話：
${conversationSummary}

注意事項：
1. 上記の会話履歴を踏まえて、文脈に沿った返答をしてください
2. 特に最後のユーザー発言に対して適切に応答してください
3. 初回の挨拶は既にしているので、具体的な対応に集中してください
4. 同じ質問を繰り返さないでください`;

  const contextMessage: ChatCompletionMessageParam = {
    role: "system",
    content: contextSummary,
  };

  const conversationMessages: ChatCompletionMessageParam[] = messages.map(
    (msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.body,
    })
  );

  return [systemMessage, contextMessage, ...conversationMessages];
}

// チャット履歴を取得する関数
async function getChatHistory(
  chatRoomId: number,
  userId: string
): Promise<Message[]> {
  try {
    if (!chatRoomId) {
      return [];
    }

    const response = await fetch(
      `${API_PHP_URL}?action=get_chat_history&chatRoomId=${chatRoomId}&userId=${userId}`,
      {
        headers: {
          Authorization: "Basic " + process.env.API_AUTH,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.success) {
      return [];
    }

    // メッセージを時系列順にソート
    const messages = data.data.messages as Message[];
    messages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return messages;
  } catch (error) {
    return [];
  }
}

interface PHPResponse {
  success: boolean;
  error?: string;
  data: {
    message: string;
    chatRoomId: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chatRoomId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: "メッセージは必須です" },
        { status: 400 }
      );
    }

    // メッセージをDBに保存
    const formData = new FormData();
    formData.append("action", "save_message");
    formData.append("message", message);
    formData.append("userId", (token.sub || token.id || "0").toString());
    if (chatRoomId) {
      formData.append("chatRoomId", chatRoomId.toString());
    }

    const dbResponse = await fetch(`${API_PHP_URL}?action=save_message`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + process.env.API_AUTH,
      },
      body: formData,
    });

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text();
      throw new Error("メッセージの保存に失敗しました");
    }

    const dbData = (await dbResponse.json()) as PHPResponse;
    const currentChatRoomId = dbData.data.chatRoomId;

    // OpenAI APIの呼び出し
    let assistantMessage: string;
    if (!openai || !OPENAI_API_KEY) {
      throw new Error(
        "OpenAI APIの設定が正しくありません。環境変数 OPENAI_API_KEY を確認してください。"
      );
    }

    try {
      // チャット履歴を取得（新しいチャットルームIDを使用）
      const history = await getChatHistory(
        currentChatRoomId,
        token.sub || token.id || "0"
      );

      // 初回メッセージの場合は履歴チェックをスキップ
      const messages = convertHistoryToMessages(history);

      const completion = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages,
        temperature: 0.3,
        max_tokens: 1000,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      });

      assistantMessage = formatAssistantMessage(
        completion.choices[0].message.content ??
          "申し訳ございません。応答の生成に失敗しました。"
      );
    } catch (apiError) {
      console.error("OpenAI API Error:", apiError);
      throw new Error(
        "チャットボットの応答生成に失敗しました。しばらく時間をおいて再度お試しください。"
      );
    }

    // アシスタントの応答をDBに保存
    const assistantFormData = new FormData();
    assistantFormData.append("action", "save_message");
    assistantFormData.append("message", assistantMessage);
    assistantFormData.append("sender", "assistant");
    assistantFormData.append(
      "userId",
      (token.sub || token.id || "0").toString()
    );
    assistantFormData.append("chatRoomId", currentChatRoomId.toString());

    const assistantResponse = await fetch(
      `${API_PHP_URL}?action=save_message`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + process.env.API_AUTH,
        },
        body: assistantFormData,
      }
    );

    if (!assistantResponse.ok) {
      const errorText = await assistantResponse.text();
      throw new Error("アシスタントの応答の保存に失敗しました");
    }

    const assistantData = (await assistantResponse.json()) as PHPResponse;

    return NextResponse.json({
      success: true,
      data: {
        message: assistantMessage,
        chatRoomId: currentChatRoomId,
      },
    });
  } catch (error) {
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
