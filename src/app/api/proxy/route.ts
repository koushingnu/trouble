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
    const response = await fetch(API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${responseText}`);
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
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
