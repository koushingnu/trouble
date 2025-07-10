import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function getAuthHeader() {
  const apiAuth = process.env.API_AUTH;
  if (!apiAuth) {
    console.error("API_AUTH is not set in environment variables");
    throw new Error("API_AUTH environment variable is not set");
  }
  return `Basic ${apiAuth}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[POST] Request body:", JSON.stringify(body, null, 2));

    // URLにactionパラメータを追加
    const url = `${API_BASE}?action=register`;
    const authHeader = getAuthHeader();

    console.log("[POST] Request URL:", url);
    console.log("[POST] Headers:", {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authHeader,
    });

    // フォームデータとしてリクエストを送信
    const formData = new URLSearchParams();
    formData.append("email", body.email);
    formData.append("password", body.password);
    formData.append("token", body.token);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: authHeader,
      },
      body: formData,
    });

    console.log("[POST] Response status:", response.status);
    const responseText = await response.text();
    console.log("[POST] Response body:", responseText);

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
      const data = JSON.parse(responseText);
      if (!data.success && data.error) {
        throw new Error(data.error);
      }
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("[POST] JSON parse error:", parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
  } catch (error) {
    console.error("[POST] Detailed API Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "登録に失敗しました",
      },
      { status: 500 }
    );
  }
}
