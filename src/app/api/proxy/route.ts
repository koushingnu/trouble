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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const url = id ? `${API_BASE}?id=${id}` : API_BASE;

  try {
    const authHeader = getAuthHeader();
    console.log("[GET] Making request to:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
      },
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
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
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
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[POST] Request body:", JSON.stringify(body, null, 2));

    // 新しいスキーマに合わせてデータを送信
    const formData = new URLSearchParams();
    formData.append("email", body.email);
    formData.append("password", body.password);
    formData.append("token", body.token);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: getAuthHeader(),
    };
    console.log("[POST] Request headers:", headers);
    console.log("[POST] Form data:", formData.toString());

    const response = await fetch(API_BASE, {
      method: "POST",
      headers,
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
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
