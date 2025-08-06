import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // 既存のデータを削除
    await prisma.accessLog.deleteMany({});
    await prisma.token.deleteMany({});
    await prisma.user.deleteMany({});

    // 新しいパスワードでユーザーを作成
    const password = "Koushin1022";
    const hashedPassword = await hash(password, 10);
    console.log("Generated hash:", hashedPassword);

    // トークンを作成
    const token = await prisma.token.create({
      data: {
        token_value: uuidv4(),
        status: "ACTIVE",
      },
    });

    // 管理者ユーザーを作成（トークンと紐付け）
    const adminUser = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: hashedPassword,
        is_admin: true,
        token_id: token.id, // トークンを紐付け
      },
      include: {
        token: true, // トークン情報も取得
      },
    });

    // アクセスログを作成
    const accessLog = await prisma.accessLog.create({
      data: {
        user_id: adminUser.id,
        event: "user_created",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Test user created with token",
      data: {
        email: "admin@test.com",
        password: password,
        hashedPassword,
        user: adminUser,
        token: token,
        accessLog: accessLog,
      },
    });
  } catch (error) {
    console.error("Error creating test user:", error);
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
