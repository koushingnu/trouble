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

    console.log("[DEBUG] Fetching chat history:", {
      chatRoomId,
      userId: token.sub || token.id,
    });

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
      console.error("[DEBUG] Chat history fetch failed:", errorText);
      throw new Error(`Failed to fetch chat history: ${errorText}`);
    }

    const rawResponse = await response.text();
    console.log("[DEBUG] Raw PHP response:", rawResponse);

    let data;
    try {
      data = JSON.parse(rawResponse);
      console.log("[DEBUG] Parsed PHP response:", {
        success: data.success,
        error: data.error,
        dataType: typeof data.data,
        messagesLength: data.data?.messages?.length,
        rawData: JSON.stringify(data).substring(0, 200) + "...",
      });
    } catch (error) {
      console.error("[DEBUG] Failed to parse PHP response:", error);
      throw new Error("Invalid JSON response from server");
    }

    if (!data || typeof data !== "object") {
      console.error("[DEBUG] Invalid response format:", data);
      throw new Error("Invalid response format from server");
    }

    if (!data.success) {
      console.error("[DEBUG] API request failed:", data.error);
      return NextResponse.json(
        { success: false, error: data.error || "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    if (!Array.isArray(data.data?.messages)) {
      console.error("[DEBUG] Invalid messages format:", data.data);
      throw new Error("Invalid messages format from server");
    }

    // メッセージを時系列順にソート
    const messages = data.data.messages as SortableMessage[];
    messages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    console.log("[DEBUG] Returning messages:", {
      count: messages.length,
      firstMessage: messages[0]
        ? {
            sender: messages[0].sender,
            body: messages[0].body.substring(0, 50) + "...",
            created_at: messages[0].created_at,
          }
        : null,
      lastMessage: messages[messages.length - 1]
        ? {
            sender: messages[messages.length - 1].sender,
            body: messages[messages.length - 1].body.substring(0, 50) + "...",
            created_at: messages[messages.length - 1].created_at,
          }
        : null,
    });

    return NextResponse.json({
      success: true,
      data: {
        messages,
        chatRoomId: parseInt(chatRoomId, 10),
      },
    });
  } catch (error) {
    console.error("[DEBUG] Error in chat history endpoint:", error);
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
