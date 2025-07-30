import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { Message } from "@/types/chat";

const API_PHP_URL =
  process.env.NEXT_PUBLIC_API_BASE || "https://ttsv.sakura.ne.jp/api.php";

interface SortableMessage extends Message {
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatRoomId = searchParams.get("chatRoomId");

    if (!chatRoomId) {
      return NextResponse.json(
        { success: false, error: "Chat room ID is required" },
        { status: 400 }
      );
    }

    // チャット履歴を取得
    const url = new URL(API_PHP_URL);
    url.searchParams.append("action", "get_chat_history");
    url.searchParams.append("chatRoomId", chatRoomId);
    url.searchParams.append(
      "userId",
      (token.sub || token.id || "0").toString()
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: "Basic " + process.env.API_AUTH,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch chat history: ${errorText}`);
    }

    const rawResponse = await response.text();

    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (error) {
      throw new Error("Invalid JSON response from server");
    }

    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format from server");
    }

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    if (!Array.isArray(data.data?.messages)) {
      throw new Error("Invalid messages format from server");
    }

    // メッセージを時系列順にソート
    const messages = data.data.messages as SortableMessage[];
    messages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        messages,
        chatRoomId: parseInt(chatRoomId, 10),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
 