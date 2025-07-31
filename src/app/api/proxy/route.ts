import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://ttsv.sakura.ne.jp/api.php";

// 共通のヘッダー作成関数
async function getAuthHeaders(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token?.token) {
    throw new Error("認証が必要です");
  }
  return {
    Authorization: `Basic ${process.env.API_AUTH}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    const response = await fetch(API_BASE, {
      headers,
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
    console.error("Proxy GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "内部サーバーエラー" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    const formData = await request.formData();
    const body = new URLSearchParams();

    // FormDataの各フィールドをURLSearchParamsに変換
    formData.forEach((value, key) => {
      body.append(key, value.toString());
    });

    const response = await fetch(API_BASE, {
      method: "POST",
      headers,
      body: body.toString(),
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
    console.error("Proxy POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "内部サーバーエラー" },
      { status: 500 }
    );
  }
}
