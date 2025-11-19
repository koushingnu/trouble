import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const chatRoomId = parseInt(params.id, 10);
    if (isNaN(chatRoomId)) {
      return NextResponse.json(
        { success: false, error: "Invalid chat room ID" },
        { status: 400 }
      );
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { user: true },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { success: false, error: "Chat room not found" },
        { status: 404 }
      );
    }

    const userId =
      typeof session.user.id === "string"
        ? parseInt(session.user.id, 10)
        : session.user.id;

    if (chatRoom.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chatRoom,
    });
  } catch (error) {
    console.error("Error fetching chat room:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log("[DEBUG] PATCH request to /api/chat/rooms/[id]", {
    id: params.id,
    method: request.method,
  });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const chatRoomId = parseInt(params.id, 10);
    if (isNaN(chatRoomId)) {
      console.error("[DEBUG] Invalid chat room ID:", params.id);
      return NextResponse.json(
        { success: false, error: "Invalid chat room ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("[DEBUG] Request body:", body);
    const { status, resolved_at } = body;

    // チャットルームの所有者確認
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
      include: { user: true },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { success: false, error: "Chat room not found" },
        { status: 404 }
      );
    }

    const userId =
      typeof session.user.id === "string"
        ? parseInt(session.user.id, 10)
        : session.user.id;
    if (chatRoom.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log("[DEBUG] Updating chat room:", {
      chatRoomId,
      status,
      resolved_at,
      userId: session.user.id,
    });

    // ステータス更新
    const updatedChatRoom = await prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: {
        status,
        resolved_at: resolved_at ? new Date(resolved_at) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedChatRoom,
    });
  } catch (error) {
    console.error("Error updating chat room:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
