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
    console.log("Making request to:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      console.error("API responded with status:", response.status);
      console.error("API response text:", await response.text());
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Detailed API Error:", {
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
    const formData = new URLSearchParams();
    formData.append("name", body.name);
    formData.append("email", body.email);

    const authHeader = getAuthHeader();
    console.log("Making POST request to:", API_BASE);

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("API responded with status:", response.status);
      console.error("API response text:", await response.text());
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Detailed API Error:", {
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
