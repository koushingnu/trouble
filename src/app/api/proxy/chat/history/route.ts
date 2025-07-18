import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { APIResponse, ChatRoom } from "@/types/chat";

const API_PHP_URL =
  process.env.NEXT_PUBLIC_API_BASE || "https://ttsv.sakura.ne.jp/api.php";

type ChatRoomsResponse = APIResponse<{ chatRooms: ChatRoom[] }>;

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // チャットルーム一覧を取得
    const url = new URL(API_PHP_URL);
    url.searchParams.append("action", "get_chat_rooms");
    url.searchParams.append(
      "userId",
      (token.sub || token.id || "0").toString()
    );

    console.log("[DEBUG] Fetching chat rooms:", {
      url: url.toString(),
      userId: token.sub || token.id,
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: "Basic " + process.env.API_AUTH,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[DEBUG] Chat rooms fetch failed:", errorText);
      throw new Error(`Failed to fetch chat rooms: ${errorText}`);
    }

    const rawResponse = await response.text();
    console.log("[DEBUG] Raw PHP response:", rawResponse);

    let data: ChatRoomsResponse;
    try {
      data = JSON.parse(rawResponse);
      console.log("[DEBUG] Parsed PHP response:", {
        success: data.success,
        error: data.error,
        chatRoomsCount: data.data?.chatRooms?.length,
      });
    } catch (error) {
      console.error("[DEBUG] Failed to parse PHP response:", error);
      throw new Error("Invalid JSON response from server");
    }

    if (!data.success) {
      console.error("[DEBUG] API request failed:", data.error);
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
  } catch (error) {
    console.error("[DEBUG] Error in chat rooms endpoint:", error);
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
