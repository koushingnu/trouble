import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// チャットルーム作成 (POST)
export async function POST(request: NextRequest) {
  try {
    console.log("\n=== Create Chat Room API Start ===");
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      console.log("Unauthorized access attempt or missing user ID in token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token.id, 10);
    if (isNaN(userId)) {
      console.log("Invalid user ID in token:", token.id);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    console.log("User ID:", userId);

    // 新しいチャットルームを作成
    const chatRoom = await prisma.chatRoom.create({
      data: {
        user_id: userId,
        status: "IN_PROGRESS", // 明示的に進行中ステータスを設定
      },
    });

    console.log("Created chat room:", chatRoom);
    console.log("=== Create Chat Room API End ===");

    return NextResponse.json({
      success: true,
      data: {
        chatRoomId: chatRoom.id,
        created_at: chatRoom.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating chat room:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "チャットルームの作成に失敗しました",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// チャットルーム一覧取得 (GET)
export async function GET(request: NextRequest) {
  try {
    console.log("\n=== Get Chat Rooms API Start ===");
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      console.log("Unauthorized access attempt or missing user ID in token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token.id, 10);
    if (isNaN(userId)) {
      console.log("Invalid user ID in token:", token.id);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    console.log("User ID:", userId);

    // ユーザーのチャットルーム一覧を最新メッセージと一緒に取得（N+1解消）
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        user_id: userId,
      },
      include: {
        messages: {
          orderBy: {
            created_at: "desc",
          },
          take: 1, // 最新メッセージのみ
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    console.log("Found chat rooms:", chatRooms.length);

    // フォーマット（N+1解消: 1回のクエリで全データ取得済み）
    const formattedRooms = chatRooms.map((room) => {
      const latestMessage = room.messages[0];
      console.log(`Chat room ${room.id} latest message:`, latestMessage);

      return {
        id: room.id,
        created_at: room.created_at,
        status: room.status,
        resolved_at: room.resolved_at,
        last_message: latestMessage?.body || null,
        last_message_at: latestMessage?.created_at || null,
      };
    });

    console.log("Formatted rooms:", formattedRooms);
    console.log("=== Get Chat Rooms API End ===");

    return NextResponse.json({
      success: true,
      data: formattedRooms,
    });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "チャットルーム一覧の取得に失敗しました",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// チャットルーム削除 (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    console.log("\n=== Delete Chat Room API Start ===");
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      console.log("Unauthorized access attempt or missing user ID in token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(token.id, 10);
    if (isNaN(userId)) {
      console.log("Invalid user ID in token:", token.id);
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    console.log("User ID:", userId);

    const { searchParams } = new URL(request.url);
    const chatRoomIdParam = searchParams.get("chatRoomId");

    if (!chatRoomIdParam) {
      console.log("Missing chatRoomId");
      return NextResponse.json(
        { success: false, error: "Chat room ID is required" },
        { status: 400 }
      );
    }

    const chatRoomId = parseInt(chatRoomIdParam, 10);
    if (isNaN(chatRoomId)) {
      console.log("Invalid chatRoomId:", chatRoomIdParam);
      return NextResponse.json(
        { success: false, error: "Invalid chat room ID" },
        { status: 400 }
      );
    }

    // トランザクションでメッセージとチャットルームを削除
    await prisma.$transaction(async (tx) => {
      // チャットルームの存在と所有権を確認
      const chatRoom = await tx.chatRoom.findUnique({
        where: {
          id: chatRoomId,
          user_id: userId,
        },
      });

      if (!chatRoom) {
        console.log(
          "Chat room not found or unauthorized for deletion:",
          chatRoomId
        );
        throw new Error("Chat room not found or unauthorized");
      }

      // メッセージを削除
      await tx.message.deleteMany({
        where: {
          chat_room_id: chatRoomId,
        },
      });
      console.log(`Deleted messages for chat room ${chatRoomId}.`);

      // チャットルームを削除
      await tx.chatRoom.delete({
        where: {
          id: chatRoomId,
        },
      });
      console.log(`Deleted chat room ${chatRoomId}.`);
    });

    console.log("Chat room deleted successfully");
    console.log("=== Delete Chat Room API End ===");

    return NextResponse.json({
      success: true,
      message: "チャットルームが削除されました",
    });
  } catch (error) {
    console.error("Error deleting chat room:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "チャットルームの削除に失敗しました",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
