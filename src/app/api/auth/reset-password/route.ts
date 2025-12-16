import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();

    // バリデーション
    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "パスワードは6文字以上で設定してください" },
        { status: 400 }
      );
    }

    // 1. メールアドレスと認証キーでユーザーを検索
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
      },
      include: {
        token: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "メールアドレスが見つかりません" },
        { status: 404 }
      );
    }

    // 2. 認証キーの確認
    if (!user.token) {
      return NextResponse.json(
        { error: "認証キーが割り当てられていません" },
        { status: 400 }
      );
    }

    if (user.token.token_value !== token) {
      return NextResponse.json(
        { error: "認証キーが正しくありません" },
        { status: 401 }
      );
    }

    // 3. 認証キーのステータス確認（使用中のみ許可）
    if (user.token.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "この認証キーは使用できません" },
        { status: 400 }
      );
    }

    // 4. 新しいパスワードをハッシュ化
    const hashedPassword = await hash(newPassword, 10);

    // 5. パスワードを更新
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "パスワードを再設定しました",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "パスワードのリセットに失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

