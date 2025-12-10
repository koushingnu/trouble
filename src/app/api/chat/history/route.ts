import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { Message } from "@/types/chat";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SortableMessage extends Message {
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("\n=== Chat History Prisma API Start ===");
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
    console.log("Chat Room ID:", chatRoomId);

    // チャットルームの存在確認と所有者チェック
    const chatRoom = await prisma.chatRoom.findUnique({
      where: {
        id: parseInt(chatRoomId, 10),
        user_id: parseInt(token.id, 10),
      },
      include: {
        messages: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
    });

    if (!chatRoom) {
      console.log("Chat room not found or unauthorized");
      return NextResponse.json(
        { success: false, error: "Chat room not found" },
        { status: 404 }
      );
    }

    // メッセージを整形
    const messages = chatRoom.messages.map((msg) => ({
      id: msg.id,
      chat_room_id: msg.chat_room_id,
      sender: msg.sender,
      body: msg.body,
      created_at: msg.created_at.toISOString(),
    }));

    console.log("Messages count:", messages.length);
    console.log("=== Chat History Prisma API End ===");

    return NextResponse.json({
      success: true,
      data: {
        messages,
        chatRoomId: parseInt(chatRoomId, 10),
      },
    });
  } catch (error) {
    console.error("Error in chat history API:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
