import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function convertToCSV(users: any[]): string {
  // CSVヘッダー
  const headers = [
    "ID",
    "メールアドレス",
    "登録日時",
    "管理者権限",
    "トークン",
    "トークンステータス",
  ];

  // データ行の作成
  const rows = users.map((user) => [
    user.id,
    user.email,
    new Date(user.created_at).toLocaleString("ja-JP"),
    user.is_admin ? "はい" : "いいえ",
    user.token?.token_value || "",
    user.token?.status || "未割り当て",
  ]);

  // ヘッダーとデータを結合
  return [headers, ...rows]
    .map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
        )
        .join(",")
    )
    .join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 管理者のみアクセス可能
    if (!authToken.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        created_at: true,
        is_admin: true,
        token: {
          select: {
            token_value: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const csv = convertToCSV(users);

    // CSVファイルとしてレスポンスを返す
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="users.csv"',
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json(
      { error: "CSVエクスポートに失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
