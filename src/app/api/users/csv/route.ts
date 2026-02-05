import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ユーザー一覧をCSV形式でエクスポート
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
        phone_number: true,
        last_name: true,
        first_name: true,
        is_admin: true,
        created_at: true,
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

    // CSVヘッダー
    const headers = [
      "ID",
      "メールアドレス",
      "姓",
      "名",
      "電話番号",
      "認証キー",
      "ステータス",
      "管理者",
      "登録日時",
    ];

    // CSVデータ行
    const rows = users.map((user) => {
      const statusLabel = user.token?.status
        ? user.token.status === "ACTIVE"
          ? "使用中"
          : user.token.status === "REVOKED"
          ? "無効"
          : "未使用"
        : "未設定";

      return [
        user.id,
        user.email,
        user.last_name || "",
        user.first_name || "",
        user.phone_number || "",
        user.token?.token_value || "",
        statusLabel,
        user.is_admin ? "はい" : "いいえ",
        new Date(user.created_at).toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      ];
    });

    // CSV文字列を生成
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // カンマや改行を含むフィールドはダブルクォートで囲む
            const cellStr = String(cell);
            if (cellStr.includes(",") || cellStr.includes("\n") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // BOM付きUTF-8で返す（Excelで文字化けしないように）
    const bom = "\uFEFF";
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="users_${new Date().toISOString().split("T")[0]}.csv"`,
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
