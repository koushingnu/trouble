import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const prisma = new PrismaClient();

  try {
    console.log("Testing database connection...");

    // データベース接続テスト
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("Database connection successful:", testQuery);

    // ユーザー数を取得（追加の接続テスト）
    const userCount = await prisma.user.count();
    console.log("Total users in database:", userCount);

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      details: {
        connection: "OK",
        userCount,
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
