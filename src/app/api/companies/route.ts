import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 卸先会社一覧取得 (GET)
export async function GET(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { tokens: true },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedCompanies = companies.map((company) => ({
      id: company.id,
      code: company.code,
      name: company.name,
      cancellation_url: company.cancellation_url,
      created_at: company.created_at,
      token_count: company._count.tokens,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCompanies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      {
        success: false,
        error: "卸先会社一覧の取得に失敗しました",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 卸先会社作成 (POST)
export async function POST(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, name, cancellation_url } = await request.json();

    if (!code || !name || !cancellation_url) {
      return NextResponse.json(
        { success: false, error: "コード・会社名・解約URLは必須です" },
        { status: 400 }
      );
    }

    if (!/^[A-Za-z0-9]{1,20}$/.test(code)) {
      return NextResponse.json(
        {
          success: false,
          error: "コードは半角英数字20文字以内で指定してください",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.company.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "このコードは既に使用されています" },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: { code, name, cancellation_url },
    });

    return NextResponse.json({
      success: true,
      message: "卸先会社を作成しました",
      data: company,
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      {
        success: false,
        error: "卸先会社の作成に失敗しました",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
