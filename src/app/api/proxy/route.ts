import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://ttsv.sakura.ne.jp/api.php";

export async function GET(request: NextRequest) {
  try {
    // セッショントークンを取得
    const token = await getToken({ req: request });
    if (!token?.token) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const response = await fetch(API_BASE, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "APIリクエストに失敗しました" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "内部サーバーエラー" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const formData = new FormData();

    // フォームデータに変換
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to post data: ${responseText}`);
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
