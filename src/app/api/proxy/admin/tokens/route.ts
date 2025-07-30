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
  if (!token.isAdmin) {
    throw new Error("管理者権限が必要です");
  }
  return {
    Authorization: `Basic ${process.env.API_AUTH}`,
    "Content-Type": "application/json",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[POST] Request body:", JSON.stringify(body, null, 2));

    // URLにactionパラメータを追加
    const url = `${API_BASE}?action=generate_tokens`;
    const headers = await getAuthHeaders(request);

    console.log("[POST] Request URL:", url);
    console.log("[POST] Headers:", headers);

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    console.log("[POST] Response status:", response.status);
    const responseText = await response.text();
    console.log("[POST] Response body:", responseText);
    console.log(
      "[POST] Response headers:",
      Object.fromEntries(response.headers.entries())
    );

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
      if (!rawData.success && rawData.error) {
        throw new Error(rawData.error);
      }
      return NextResponse.json(rawData);
    } catch (parseError) {
      console.error("[POST] JSON parse error:", parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error("[POST] Detailed API Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    });

    let errorMessage = "トークン生成中にエラーが発生しました";
    const errorDetails =
      error instanceof Error ? error.message : "Unknown error";

    // エラーメッセージがJSON形式の場合、パースを試みる
    if (typeof errorDetails === "string" && errorDetails.includes("{")) {
      try {
        const errorData = JSON.parse(
          errorDetails.substring(
            errorDetails.indexOf("{"),
            errorDetails.lastIndexOf("}") + 1
          )
        );
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        console.error("[POST] Error parsing error message:", e);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
