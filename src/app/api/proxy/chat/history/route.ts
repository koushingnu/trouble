import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://ttsv.sakura.ne.jp/api.php";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatRoomId = searchParams.get("chatRoomId");

    // チャットルーム一覧を取得する場合
    if (!chatRoomId) {
      const url = new URL(API_BASE);
      url.searchParams.append("action", "get_chat_rooms");
      url.searchParams.append(
        "userId",
        (token.sub || token.id || "0").toString()
      );

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: "Basic " + process.env.API_AUTH,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat rooms");
      }

      const data = await response.json();
      if (!data.success) {
        return NextResponse.json(
          { success: false, error: data.error || "Failed to fetch chat rooms" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          chatRooms: data.data?.chatRooms || [],
        },
      });
    }

    // 特定のチャットルームの履歴を取得する場合
    const url = new URL(API_BASE);
    url.searchParams.append("action", "get_chat_history");
    url.searchParams.append("chatRoomId", chatRoomId);
    url.searchParams.append(
      "userId",
      (token.sub || token.id || "0").toString()
    );

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: "Basic " + process.env.API_AUTH,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: data.data.messages,
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
