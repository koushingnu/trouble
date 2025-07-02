import { NextResponse } from "next/server";

const API_BASE = "https://ttsv.sakura.ne.jp/api.php";

function getAuthHeader() {
  const apiAuth = process.env.API_AUTH;
  if (!apiAuth) {
    throw new Error("API_AUTH environment variable is not set");
  }
  return `Basic ${apiAuth}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const url = id ? `${API_BASE}?id=${id}` : API_BASE;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: getAuthHeader(),
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
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

    const response = await fetch(API_BASE, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
