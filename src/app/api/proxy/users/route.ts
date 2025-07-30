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
    Accept: "application/json",
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = `${API_BASE}?action=list_users`;
    const headers = await getAuthHeaders(request);
    console.log("[GET] Making request to:", url);

    const response = await fetch(url, {
      headers,
      cache: "no-store",
    });

    console.log("[GET] Response status:", response.status);
    const responseText = await response.text();
    console.log("[GET] Response body:", responseText);

    if (!response.ok) {
      throw new Error(
        `API responded with status ${response.status}: ${responseText}`
      );
    }

    // レスポンスが空でないことを確認
    if (!responseText.trim()) {
      throw new Error("Empty response from API");
    }

    // JSONとして解析可能か確認
    try {
      const rawData = JSON.parse(responseText);
      return NextResponse.json({
        success: true,
        data: rawData,
      });
    } catch (parseError) {
      console.error("[GET] JSON parse error:", parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error("[GET] Detailed API Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: "ユーザー一覧の取得に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
