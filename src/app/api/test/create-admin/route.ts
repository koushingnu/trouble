import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // 管理者ユーザーの作成
    const hashedPassword = await hash("Koushin1022", 10);
    const adminUser = await prisma.user.create({
      data: {
        email: "kou@test.com",
        password: hashedPassword,
        is_admin: true,
        created_at: new Date("2025-07-09 13:53:16"),
      },
    });

    // 一般ユーザーの作成
    const regularUser = await prisma.user.create({
      data: {
        email: "jiysub@hosaduy.com",
        password: hashedPassword,
        is_admin: false,
        created_at: new Date("2025-07-09 14:00:37"),
      },
    });

    // アクセスログの作成
    const accessLog = await prisma.accessLog.create({
      data: {
        user_id: regularUser.id,
        event: "user_created",
        created_at: new Date("2025-07-09 14:00:37"),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        adminUser,
        regularUser,
        accessLog,
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
