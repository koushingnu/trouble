import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

// トークン一覧の取得
export async function GET(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 管理者のみアクセス可能
    if (!authToken.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tokens = await prisma.token.findMany({
      include: {
        assigned_user: {
          select: {
            id: true,
            email: true,
            created_at: true,
          },
        },
      },
    });

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Token list error:", error);
    return NextResponse.json(
      { error: "トークン一覧の取得に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// 新しいトークンの生成
export async function POST(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 管理者のみアクセス可能
    if (!authToken.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { count = 1 } = await request.json();

    // 複数のトークンを生成
    const tokens = await Promise.all(
      Array.from({ length: count }, async () => {
        return prisma.token.create({
          data: {
            token_value: uuidv4(),
            status: "unused",
          },
        });
      })
    );

    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Token creation error:", error);
    return NextResponse.json(
      { error: "トークンの生成に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// トークンの状態更新
export async function PUT(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 管理者のみアクセス可能
    if (!authToken.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, status, assigned_to } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "トークンIDとステータスは必須です" },
        { status: 400 }
      );
    }

    // トークンの存在確認
    const existingToken = await prisma.token.findUnique({
      where: { id: Number(id) },
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: "指定されたトークンが見つかりません" },
        { status: 404 }
      );
    }

    // ユーザーの存在確認（assigned_toが指定された場合）
    if (assigned_to) {
      const user = await prisma.user.findUnique({
        where: { id: Number(assigned_to) },
      });

      if (!user) {
        return NextResponse.json(
          { error: "指定されたユーザーが見つかりません" },
          { status: 404 }
        );
      }
    }

    // トークンの更新
    const updatedToken = await prisma.token.update({
      where: { id: Number(id) },
      data: {
        status,
        assigned_to: assigned_to ? Number(assigned_to) : null,
      },
      include: {
        assigned_user: {
          select: {
            id: true,
            email: true,
            created_at: true,
          },
        },
      },
    });

    return NextResponse.json(updatedToken);
  } catch (error) {
    console.error("Token update error:", error);
    return NextResponse.json(
      { error: "トークンの更新に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
