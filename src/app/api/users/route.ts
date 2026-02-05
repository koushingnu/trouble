import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

// ユーザー一覧の取得
export async function GET(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 管理者のみアクセス可能
    if (!authToken.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        created_at: true,
        is_admin: true,
        phone_number: true,
        last_name: true,
        first_name: true,
        token: {
          select: {
            token_value: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("User list error:", error);
    return NextResponse.json(
      { error: "ユーザー一覧の取得に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ユーザー登録
export async function POST(request: NextRequest) {
  try {
    const { email, password, token, phoneNumber, lastName, firstName } =
      await request.json();

    // 入力値の検証
    if (!email || !password) {
      return NextResponse.json(
        { error: "メールアドレスとパスワードは必須です" },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { error: "パスワードは5文字以上で設定してください" },
        { status: 400 }
      );
    }

    // 電話番号・姓名のバリデーション
    if (!phoneNumber || !lastName || !firstName) {
      return NextResponse.json(
        { error: "電話番号、姓、名は必須です" },
        { status: 400 }
      );
    }

    // 電話番号の形式チェック（ハイフンなし）
    // 携帯: 0X0-XXXX-XXXX (11桁) または 固定: 0X-XXXX-XXXX (10桁)
    const phoneRegex = /^(0[5-9]0\d{8}|0[1-9]\d{8})$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "電話番号は10桁または11桁の数字で入力してください（例: 08012345678）" },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      );
    }

    // トークンの検証（トークンが提供された場合）
    let tokenRecord = null;
    if (token) {
      tokenRecord = await prisma.token.findFirst({
        where: {
          token_value: token,
          status: "UNUSED",
        },
      });

      if (!tokenRecord) {
        return NextResponse.json(
          { error: "無効なトークンです" },
          { status: 400 }
        );
      }
    }

    // パスワードのハッシュ化
    const hashedPassword = await hash(password, 12);

    // トランザクションでユーザー作成とトークン更新を実行
    const user = await prisma.$transaction(async (tx) => {
      // ユーザーの作成
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          token_id: tokenRecord?.id,
          phone_number: phoneNumber,
          last_name: lastName,
          first_name: firstName,
        },
      });

      // トークンの更新（トークンが提供された場合）
      if (tokenRecord) {
        await tx.token.update({
          where: { id: tokenRecord.id },
          data: {
            status: "ACTIVE",
            assigned_to: newUser.id,
          },
        });
      }

      // アクセスログの作成
      await tx.accessLog.create({
        data: {
          user_id: newUser.id,
          event: "user_registered",
        },
      });

      return newUser;
    });

    return NextResponse.json({
      success: true,
      message: "ユーザー登録が完了しました",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { error: "ユーザー登録に失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
