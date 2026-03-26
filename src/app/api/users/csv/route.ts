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
        company_serial_number: true,
        acquisition_source: true,
        last_name_kana: true,
        first_name_kana: true,
        postal_code: true,
        address: true,
        is_admin: true,
        created_at: true,
        token: {
          select: {
            token_value: true,
            status: true,
            registered_at: true,
            cancelled_at: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // CSVヘッダー（画像の順番に合わせる + 登録日・退会月・会員ステータス）
    const headers = [
      "自社通番",
      "獲得施策",
      "お客様名前",
      "お客様名前フリガナ",
      "メールアドレス",
      "連絡先",
      "郵便番号",
      "ご住所（都道府県東部等、建物名部屋番号等）",
      "登録日",
      "退会月",
      "会員ステータス",
    ];

    // CSVデータ行
    const rows = users.map((user) => {
      // 姓名を結合
      const fullName = [user.last_name, user.first_name]
        .filter(Boolean)
        .join(" ") || "";
      
      // フリガナを結合
      const fullNameKana = [user.last_name_kana, user.first_name_kana]
        .filter(Boolean)
        .join(" ") || "";

      // 登録日（YYYY-MM-DD形式）
      const registeredAt = user.token?.registered_at
        ? new Date(user.token.registered_at).toISOString().split('T')[0]
        : "";

      // 退会日（YYYY-MM形式）
      const cancelledAt = user.token?.cancelled_at
        ? new Date(user.token.cancelled_at).toISOString().slice(0, 7)
        : "";

      // 会員ステータス（日本語表記）
      let memberStatus = "";
      if (user.token?.status === "ACTIVE") {
        memberStatus = "契約";
      } else if (user.token?.status === "REVOKED") {
        memberStatus = "退会";
      } else if (user.token?.status === "UNUSED") {
        memberStatus = "未使用";
      }

      return [
        user.company_serial_number || "",
        user.acquisition_source || "",
        fullName,
        fullNameKana,
        user.email,
        user.phone_number || "",
        user.postal_code || "",
        user.address || "",
        registeredAt,
        cancelledAt,
        memberStatus,
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
