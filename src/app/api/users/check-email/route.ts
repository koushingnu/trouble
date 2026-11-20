import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "メールアドレスと認証キーが必要です" },
        { status: 400 }
      );
    }

    // 登録手続き中の本人（未使用の認証キーを持つ人）だけが確認できるようにし、
    // 第三者が任意のメールアドレスの登録有無を調べられないようにする
    const validToken = await prisma.token.findFirst({
      where: { token_value: token, status: "UNUSED" },
      select: { id: true },
    });
    if (!validToken) {
      return NextResponse.json(
        { error: "認証キーが正しくありません" },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "メールアドレスの確認中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
