import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function PUT(request: Request) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "現在のパスワードと新しいパスワードは必須です" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE}?action=change_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + process.env.API_AUTH,
      },
      body: JSON.stringify({
        userId: token.sub,
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "パスワードの変更に失敗しました");
    }

    return NextResponse.json({ success: true });
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
