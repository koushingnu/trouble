import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const RESET_FAILURE_LIMIT = 10;
const RESET_FAILURE_WINDOW_MS = 15 * 60 * 1000;

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

    if (newPassword.length < 5) {
      return NextResponse.json(
        { error: "パスワードは5文字以上で設定してください" },
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

    // 登録有無を推測されないよう、失敗理由はすべて同じメッセージで返す
    const invalidResponse = () =>
      NextResponse.json(
        { error: "メールアドレスまたは認証キーが正しくありません" },
        { status: 400 }
      );

    if (!user) {
      return invalidResponse();
    }

    // 総当たり対策：同一アカウントへの失敗が続いた場合は一時的にロック
    const recentFailures = await prisma.accessLog.count({
      where: {
        user_id: user.id,
        event: "password_reset_failed",
        created_at: { gte: new Date(Date.now() - RESET_FAILURE_WINDOW_MS) },
      },
    });
    if (recentFailures >= RESET_FAILURE_LIMIT) {
      return NextResponse.json(
        {
          error:
            "失敗が続いたため一時的にロックしています。15分ほど時間をおいて再度お試しください",
        },
        { status: 429 }
      );
    }

    // 2. 認証キーの確認（使用中のキーのみ許可）
    if (
      !user.token ||
      user.token.token_value !== token ||
      user.token.status !== "ACTIVE"
    ) {
      await prisma.accessLog.create({
        data: { user_id: user.id, event: "password_reset_failed" },
      });
      return invalidResponse();
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
  }
}

