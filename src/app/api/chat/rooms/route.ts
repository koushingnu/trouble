import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// チャットルーム作成 (POST)
export async function POST(request: NextRequest) {
  try {
    console.log("\n=== Create Chat Room API Start ===");
    const token = await getToken({ req: request });
    if (!token) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User ID:", token.id);

    // 新しいチャットルームを作成
    const chatRoom = await prisma.chatRoom.create({
      data: {
        user_id: parseInt(token.id, 10),
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
    if (!token) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // トークンからユーザーIDを取得
    const userId = parseInt(token.id, 10);
    console.log("User ID:", userId);

    // ユーザー情報を確認
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    console.log("Found user:", user);

    if (!user) {
      console.log("User not found in database");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // ユーザーのチャットルーム一覧を取得
    const chatRooms = await prisma.chatRoom.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    console.log("Found chat rooms:", chatRooms.length);

    // 各チャットルームの最新メッセージを取得
    const formattedRooms = await Promise.all(
      chatRooms.map(async (room) => {
        const latestMessage = await prisma.message.findFirst({
          where: {
            chat_room_id: room.id,
          },
          orderBy: {
            created_at: "desc",
          },
        });

        console.log(`Chat room ${room.id} latest message:`, latestMessage);

        return {
          id: room.id,
          created_at: room.created_at,
          last_message: latestMessage?.body || null,
          last_message_at: latestMessage?.created_at || null,
        };
      })
    );

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
    if (!token) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User ID:", token.id);

    const { searchParams } = new URL(request.url);
    const chatRoomId = searchParams.get("chatRoomId");

    if (!chatRoomId) {
      console.log("Missing chatRoomId");
      return NextResponse.json(
        { success: false, error: "Chat room ID is required" },
        { status: 400 }
      );
    }

    // トランザクションでメッセージとチャットルームを削除
    await prisma.$transaction(async (tx) => {
      // チャットルームの存在と所有権を確認
      const chatRoom = await tx.chatRoom.findUnique({
        where: {
          id: parseInt(chatRoomId, 10),
          user_id: parseInt(token.id, 10),
        },
      });

      if (!chatRoom) {
        throw new Error("Chat room not found or unauthorized");
      }

      // メッセージを削除
      await tx.message.deleteMany({
        where: {
          chat_room_id: parseInt(chatRoomId, 10),
        },
      });

      // チャットルームを削除
      await tx.chatRoom.delete({
        where: {
          id: parseInt(chatRoomId, 10),
        },
      });
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