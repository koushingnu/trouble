import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// トークン一覧取得 (GET)
export async function GET(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await prisma.token.findMany({
      include: {
        assigned_user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // レスポンスデータの整形
    const formattedTokens = tokens.map((token) => ({
      id: token.id,
      token_value: token.token_value,
      status: token.status,
      user_email: token.assigned_user?.email || null,
      created_at: token.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedTokens,
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      {
        success: false,
        error: "トークン一覧の取得に失敗しました",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// トークン生成 (POST)
export async function POST(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count = 1 } = await request.json();

    if (count < 1 || count > 10000) {
      return NextResponse.json(
        { error: "生成数は1から10000の間で指定してください" },
        { status: 400 }
      );
    }

    // 指定された数のトークンを生成
    const tokens = await Promise.all(
      Array.from({ length: count }, async () => {
        return prisma.token.create({
          data: {
            token_value: crypto.randomUUID(),
            status: "unused",
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `${count}個のトークンを生成しました`,
      data: tokens,
    });
  } catch (error) {
    console.error("Error generating tokens:", error);
    return NextResponse.json(
      {
        success: false,
        error: "トークン生成に失敗しました",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
