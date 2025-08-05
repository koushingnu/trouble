import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

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
      select: {
        id: true,
        email: true,
        is_admin: true,
        created_at: true,
        chat_rooms: {
          include: {
            messages: {
              orderBy: {
                created_at: "desc",
              },
              take: 1,
            },
          },
          orderBy: {
            created_at: "desc",
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

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          is_admin: user.is_admin,
          created_at: user.created_at,
        },
        chat_rooms: user.chat_rooms.map(room => ({
          id: room.id,
          created_at: room.created_at,
          last_message: room.messages[0]?.body || null,
          last_message_at: room.messages[0]?.created_at || null,
        })),
      },
    });
  } catch (error) {
    console.error("Chat status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}