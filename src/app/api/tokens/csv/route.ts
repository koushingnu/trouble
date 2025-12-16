import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// CSVデータに変換するヘルパー関数
function convertToCSV(tokens: any[]): string {
  const headers = ["ID", "認証キー", "ステータス", "使用ユーザー", "生成日時"];
  const csvRows = [headers.join(",")];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "使用中";
      case "REVOKED":
        return "無効";
      case "UNUSED":
        return "未使用";
      default:
        return "未設定";
    }
  };

  for (const token of tokens) {
    const row = [
      token.id,
      `"${token.token_value}"`, // 認証キーをダブルクォートで囲む
      getStatusLabel(token.status),
      token.assigned_user?.email || "未割り当て",
      new Date(token.created_at).toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    ];
    csvRows.push(row.join(","));
  }

  return csvRows.join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const authToken = await getToken({ req: request });
    if (!authToken || !authToken.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // トークン一覧を取得
    const tokens = await prisma.token.findMany({
      include: {
        assigned_user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // CSVデータに変換
    const csvData = convertToCSV(tokens);

    // BOM付きUTF-8でエンコード（Excelで正しく開くため）
    const bom = "\uFEFF";
    const csvWithBom = bom + csvData;

    // CSVファイルとしてレスポンスを返す
    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tokens_${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json(
      { error: "CSVのエクスポートに失敗しました" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

