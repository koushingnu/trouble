import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    console.log("\n=== DB Status Check Start ===");

    // 1. データベース接続テスト
    console.log("Testing database connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection successful");

    // 2. 環境変数確認
    console.log("Environment variables:");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("DATABASE_URL:", process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

    // 3. 認証状態確認
    const token = await getToken({ req: request });
    console.log("Auth token:", token ? "Present" : "Not present");
    if (token) {
      console.log("Token user ID:", token.id);
    }

    // 4. テーブル情報取得
    const userCount = await prisma.user.count();
    const tokenCount = await prisma.token.count();
    const chatRoomCount = await prisma.chatRoom.count();
    const messageCount = await prisma.message.count();

    console.log("Table counts:", {
      users: userCount,
      tokens: tokenCount,
      chatRooms: chatRoomCount,
      messages: messageCount,
    });

    // 5. チャットルーム詳細
    const chatRooms = await prisma.chatRoom.findMany({
      include: {
        messages: {
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
    });

    const chatRoomDetails = chatRooms.map(room => ({
      id: room.id,
      user_id: room.user_id,
      created_at: room.created_at,
      message_count: room.messages.length,
      latest_message: room.messages[0]?.body || null,
    }));

    console.log("=== DB Status Check End ===");

    return NextResponse.json({
      success: true,
      data: {
        database_connected: true,
        environment: process.env.NODE_ENV,
        auth_status: {
          token_present: !!token,
          user_id: token?.id,
        },
        counts: {
          users: userCount,
          tokens: tokenCount,
          chatRooms: chatRoomCount,
          messages: messageCount,
        },
        chat_rooms: chatRoomDetails,
      },
    });
  } catch (error) {
    console.error("Error checking DB status:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}