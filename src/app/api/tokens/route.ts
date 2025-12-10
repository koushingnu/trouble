import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// トークン一覧取得 (GET)
export async function GET(request: NextRequest) {
  try {
    console.log("\n=== Token List Fetch Start ===");
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // まずトークンの総数を確認
    const totalCount = await prisma.token.count();
    console.log("Total token count:", totalCount);

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

    console.log("Fetched tokens count:", tokens.length);
    console.log(
      "Token status distribution:",
      tokens.reduce(
        (acc, token) => {
          acc[token.status] = (acc[token.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    );

    // レスポンスデータの整形
    const formattedTokens = tokens.map((token) => ({
      id: token.id,
      token_value: token.token_value,
      status: token.status,
      user_email: token.assigned_user?.email || null,
      created_at: token.created_at,
    }));

    console.log("=== Token List Fetch End ===\n");

    return NextResponse.json({
      success: true,
      data: formattedTokens,
      debug: {
        totalCount,
        fetchedCount: tokens.length,
      },
    });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      {
        success: false,
        error: "トークン一覧の取得に失敗しました",
        debug: error instanceof Error ? error.message : String(error),
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
    console.log("\n=== Token Generation Start ===");
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count = 1 } = await request.json();
    console.log("Requested token count:", count);

    if (count < 1 || count > 10000) {
      console.log("Invalid count requested:", count);
      return NextResponse.json(
        { error: "生成数は1から10000の間で指定してください" },
        { status: 400 }
      );
    }

    // トランザクションでトークンを一括生成
    console.log("Starting token generation transaction");
    const tokens = await prisma.$transaction(
      Array.from({ length: count }, () => {
        return prisma.token.create({
          data: {
            token_value: crypto.randomUUID(),
            status: "UNUSED",
          },
        });
      })
    );
    console.log("Generated tokens count:", tokens.length);

    // 生成後の総数を確認
    const totalCount = await prisma.token.count();
    console.log("Total token count after generation:", totalCount);
    console.log("=== Token Generation End ===\n");

    return NextResponse.json({
      success: true,
      message: `${count}個のトークンを生成しました`,
      data: tokens,
      debug: {
        generatedCount: tokens.length,
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error generating tokens:", error);
    return NextResponse.json(
      {
        success: false,
        error: "トークン生成に失敗しました",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
