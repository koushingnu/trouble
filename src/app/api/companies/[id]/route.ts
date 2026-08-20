import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 卸先会社更新 (PATCH)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "不正なIDです" },
        { status: 400 }
      );
    }

    const { name, cancellation_url } = await request.json();

    if (!name || !cancellation_url) {
      return NextResponse.json(
        { success: false, error: "会社名・解約URLは必須です" },
        { status: 400 }
      );
    }

    // コード(code)は認証キーの語尾サフィックスとして既に発行済みのため変更不可
    const company = await prisma.company.update({
      where: { id },
      data: { name, cancellation_url },
    });

    return NextResponse.json({
      success: true,
      message: "卸先会社を更新しました",
      data: company,
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      {
        success: false,
        error: "卸先会社の更新に失敗しました",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// 卸先会社削除 (DELETE)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "不正なIDです" },
        { status: 400 }
      );
    }

    const tokenCount = await prisma.token.count({
      where: { company_id: id },
    });

    if (tokenCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `この卸先には${tokenCount}件の認証キーが紐づいているため削除できません`,
        },
        { status: 409 }
      );
    }

    await prisma.company.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "卸先会社を削除しました",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      {
        success: false,
        error: "卸先会社の削除に失敗しました",
        debug: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
