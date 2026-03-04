import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// トークンの検証
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "トークンが指定されていません" },
        { status: 400 }
      );
    }

    // トークンの存在確認
    const tokenRecord = await prisma.token.findFirst({
      where: {
        token_value: token,
        status: "UNUSED",
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { valid: false, error: "認証キーが違います" },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "有効なトークンです",
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "トークンの検証に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
