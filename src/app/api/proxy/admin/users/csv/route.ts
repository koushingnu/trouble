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

// JSONデータをCSV文字列に変換する関数
function convertToCSV(data: any[]): string {
  // CSVヘッダー
  const headers = [
    "ID",
    "メールアドレス",
    "ユーザー種別",
    "トークン",
    "トークン状態",
    "登録日時",
  ];

  // データ行の作成
  const rows = data.map((user) => [
    user.id,
    user.email,
    user.is_admin === "1" ? "管理者" : "一般",
    user.token_value || "",
    user.status || "",
    user.created_at,
  ]);

  // ヘッダーとデータを結合
  return [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");
}

export async function GET() {
  try {
    const url = `${API_BASE}?action=list_users`;
    const authHeader = getAuthHeader();
    console.log("[CSV] Making request to:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log("[CSV] Response status:", response.status);

    const responseText = await response.text();
    console.log("[CSV] Response body:", responseText);

    if (!response.ok) {
      throw new Error(
        `API responded with status ${response.status}: ${responseText}`
      );
    }

    // JSONデータをパース
    const jsonData = JSON.parse(responseText);

    // CSVに変換
    const csvData = convertToCSV(jsonData);

    // BOMを追加してUTF-8で出力
    const csvWithBOM = "\uFEFF" + csvData;

    // CSVヘッダーを設定
    const headers = new Headers();
    headers.append("Content-Type", "text/csv; charset=UTF-8");
    headers.append("Content-Disposition", "attachment; filename=users.csv");

    return new NextResponse(csvWithBOM, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("[CSV] Detailed API Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: "ユーザーデータの取得に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
