import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_PHP_URL || "https://ttsv.sakura.ne.jp/api.php";

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
    console.log("[POST] Request body:", body);

    // action=registerを削除し、直接POSTリクエストを送信
    const url = API_BASE;
    console.log("[POST] Request URL:", url);

    const headers = {
      "Content-Type": "application/json",
      Authorization: getAuthHeader(),
    };
    console.log("[POST] Headers:", headers);

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });

    console.log("[POST] Response status:", response.status);
    const responseText = await response.text();
    console.log("[POST] Response body:", responseText);

    if (!response.ok) {
      throw new Error(responseText);
    }

    // レスポンスがJSONかどうかを確認
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json({ message: responseText });
    }
  } catch (error) {
    console.error("[POST] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
