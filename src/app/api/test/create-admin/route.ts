import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const password = await hash("test123", 10);

    // 管理者ユーザーを作成
    const user = await prisma.user.create({
      data: {
        email: "admin@test.com",
        password,
        is_admin: true,
      },
    });

    // トークンを作成
    const token = await prisma.token.create({
      data: {
        token_value: crypto.randomUUID(),
        status: "active",
        assigned_to: user.id,
      },
    });

    // ユーザーにトークンを関連付け
    await prisma.user.update({
      where: { id: user.id },
      data: { token_id: token.id },
    });

    return NextResponse.json({
      status: "success",
      message: "Admin user created",
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to create admin user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
