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
        company: {
          select: {
            code: true,
            name: true,
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
      company_id: token.company_id,
      company_name: token.company?.name || null,
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

    const body = await request.json();
    const count = body.count ?? 1;
    let company_id: number | null = body.company_id ?? null;
    console.log("Requested token count:", count, "company_id:", company_id);

    if (count < 1 || count > 10000) {
      console.log("Invalid count requested:", count);
      return NextResponse.json(
        { error: "生成数は1から10000の間で指定してください" },
        { status: 400 }
      );
    }

    // 卸先指定時は認証キーの語尾にその卸先のコードを付与する（表示用。紐付けの正はcompany_id）
    let companyCode: string | null = null;
    if (company_id !== null) {
      const company = await prisma.company.findUnique({
        where: { id: company_id },
      });
      if (!company) {
        return NextResponse.json(
          { error: "指定された卸先会社が見つかりません" },
          { status: 400 }
        );
      }
      if (company.is_default) {
        // 自社（直販）は従来通り卸先なし（company_id NULL・サフィックスなし）で発行する
        company_id = null;
      } else {
        companyCode = company.code;
      }
    }

    // 認証キーの値を先に作り、数回のINSERTにまとめて一括保存する
    // （1件ずつ保存するとDBとの往復が件数分発生し、1000件でタイムアウトしていた）
    const tokenValues = Array.from({ length: count }, () =>
      companyCode
        ? `${crypto.randomUUID()}-${companyCode}`
        : crypto.randomUUID()
    );
    const CHUNK_SIZE = 1000;
    const chunks: string[][] = [];
    for (let i = 0; i < tokenValues.length; i += CHUNK_SIZE) {
      chunks.push(tokenValues.slice(i, i + CHUNK_SIZE));
    }

    console.log("Starting token generation transaction");
    const results = await prisma.$transaction(
      chunks.map((chunk) =>
        prisma.token.createMany({
          data: chunk.map((token_value) => ({
            token_value,
            status: "UNUSED" as const,
            company_id,
          })),
        })
      )
    );
    const generatedCount = results.reduce((sum, r) => sum + r.count, 0);
    console.log("Generated tokens count:", generatedCount);

    // 生成後の総数を確認
    const totalCount = await prisma.token.count();
    console.log("Total token count after generation:", totalCount);
    console.log("=== Token Generation End ===\n");

    return NextResponse.json({
      success: true,
      message: `${count}個のトークンを生成しました`,
      debug: {
        generatedCount,
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
  }
}
