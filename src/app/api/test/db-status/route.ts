import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // データベース接続テスト
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database connection successful");

    // 各テーブルのレコード数を取得
    const userCount = await prisma.user.count();
    const tokenCount = await prisma.token.count();
    const accessLogCount = await prisma.accessLog.count();

    // トークンの状態を確認
    const tokenStatuses = await prisma.token.groupBy({
      by: ["status"],
      _count: true,
    });

    // 最新のトークンを5件取得
    const latestTokens = await prisma.token.findMany({
      take: 5,
      orderBy: {
        created_at: "desc",
      },
      include: {
        assigned_user: {
          select: {
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          tokens: tokenCount,
          accessLogs: accessLogCount,
        },
        tokenStatuses,
        latestTokens,
        databaseUrl: process.env.DATABASE_URL?.replace(/:.*@/, ':****@'), // パスワードを隠す
      },
    });
  } catch (error) {
    console.error("Database status check error:", error);
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