import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { compare, hash } from "bcryptjs";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "現在のパスワードと新しいパスワードは必須です" },
        { status: 400 }
      );
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { id: Number(token.sub) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // 現在のパスワードを確認
    const isValidPassword = await compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません" },
        { status: 400 }
      );
    }

    // 新しいパスワードをハッシュ化
    const hashedPassword = await hash(newPassword, 10);

    // パスワードを更新
    await prisma.user.update({
      where: { id: Number(token.sub) },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ 
      success: true,
      message: "パスワードを更新しました" 
    });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "パスワードの変更に失敗しました",
      },
      { status: 500 }
    );
  }
}
