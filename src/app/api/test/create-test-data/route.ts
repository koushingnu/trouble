import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log("=== Creating Test Data Start ===");

    // 既存のデータを削除
    await prisma.accessLog.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.token.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("Existing data cleared");

    // トークンを作成
    const token = await prisma.token.create({
      data: {
        token_value: uuidv4(),
        status: "ACTIVE",
      },
    });

    console.log("Token created:", {
      id: token.id,
      value: token.token_value,
      status: token.status,
    });

    // パスワードのハッシュ化
    const password = await hash("m", 10);

    // ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: "m@m",
        password: password,
        token_id: token.id,
        is_admin: true,
      },
    });

    console.log("User created:", {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin,
    });

    // トークンのassigned_toを更新
    await prisma.token.update({
      where: { id: token.id },
      data: { assigned_to: user.id },
    });

    console.log("Token assigned to user");

    // アクセスログを作成
    const accessLog = await prisma.accessLog.create({
      data: {
        user_id: user.id,
        event: "user_created",
      },
    });

    console.log("Access log created");
    console.log("=== Creating Test Data End ===");

    return NextResponse.json({
      success: true,
      message: "Test data created successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          is_admin: user.is_admin,
        },
        token: {
          id: token.id,
          value: token.token_value,
          status: token.status,
        },
        accessLog: {
          id: accessLog.id,
          event: accessLog.event,
        },
      },
    });
  } catch (error) {
    console.error("Error creating test data:", error);
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
