import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("=== Database Test Start ===");
    console.log("Testing database connection...");

    // 基本的な接続テスト
    await prisma.$queryRaw`SELECT 1`;
    console.log("Basic connection test: SUCCESS");

    // ユーザー数を取得してテスト
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      userCount,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
