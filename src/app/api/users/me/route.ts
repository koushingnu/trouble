import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(token.id, 10),
      },
      include: {
        chat_rooms: {
          include: {
            messages: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // チャットルームの統計を計算
    const chatRoomsCount = user.chat_rooms.length;
    const resolvedCount = user.chat_rooms.filter((room) =>
      room.messages.some(
        (msg) =>
          msg.sender === "assistant" && msg.body.includes("解決いたしました")
      )
    ).length;
    const inProgressCount = chatRoomsCount - resolvedCount;

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
        chat_rooms_count: chatRoomsCount,
        resolved_count: resolvedCount,
        in_progress_count: inProgressCount,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user details" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
