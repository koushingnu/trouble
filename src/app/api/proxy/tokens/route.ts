import { NextResponse } from "next/server";

const API_BASE = "https://ttsv.sakura.ne.jp/api.php";

function getAuthHeader() {
  const apiAuth = process.env.API_AUTH;
  if (!apiAuth) {
    console.error("API_AUTH is not set in environment variables");
    throw new Error("API_AUTH environment variable is not set");
  }
  return `Basic ${apiAuth}`;
}

export async function GET() {
  try {
    const url = `${API_BASE}?action=list_tokens`;
    const authHeader = getAuthHeader();
    console.log("[GET] Making request to:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
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
      return NextResponse.json(rawData);
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
        error: "トークン一覧の取得に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
