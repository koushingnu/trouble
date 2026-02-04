import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parse } from "csv-parse/sync";
import iconv from "iconv-lite";

export async function POST(req: NextRequest) {
  try {
    // 管理者権限チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.is_admin) {
      return NextResponse.json(
        { error: "管理者権限が必要です" },
        { status: 403 }
      );
    }

    // FormDataからファイルを取得
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Shift-JIS → UTF-8変換
    let decoded: string;
    try {
      decoded = iconv.decode(buffer, "Shift_JIS");
    } catch (error) {
      // Shift-JISで失敗した場合はUTF-8として試す
      decoded = buffer.toString("utf-8");
    }

    // CSV解析
    const records = parse(decoded, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // BOM対応
    }) as Record<string, string>[];

    console.log(`📊 CSVレコード数: ${records.length}`);
    console.log("📋 サンプルレコード:", records[0]);

    // 抽出結果のリスト
    const extractedData: Array<{
      rowNumber: number;
      productName: string;
      authKey: string;
      customerId: string;
      phoneNumber: string;
      status: string;
      statusMapped: "ACTIVE" | "REVOKED" | "UNUSED";
      keyToUse: string;
      isFiltered: boolean;
      skipReason?: string;
    }> = [];

    // インポート結果の統計
    const stats = {
      total: records.length,
      filtered: 0, // 「トラブル解決ラボ」のレコード数
      skipped: 0,
      details: [] as string[],
    };

    // レコードを1件ずつ処理（表示のみ、DB登録なし）
    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        // 必要なフィールドを抽出
        const productName = record["商品名"]?.trim() || "";
        const authKey = record["認証キー"]?.trim() || "";
        const phoneNumber = record["電話番号"]?.trim() || "";
        const status = record["ステータス"]?.trim() || "";
        const customerId = record["顧客ID"]?.trim() || "";

        // 認証キーまたは顧客IDのどちらかが必須
        const keyToUse = authKey || customerId;

        // ステータスを判定
        let tokenStatus: "ACTIVE" | "REVOKED" | "UNUSED" = "UNUSED";
        if (status === "承認" || status === "契約") {
          tokenStatus = "ACTIVE";
        } else if (status === "退会" || status === "解約") {
          tokenStatus = "REVOKED";
        }

        // 商品名が「トラブル解決ラボ」かチェック
        const isTargetProduct = productName === "トラブル解決ラボ";

        // スキップ理由の判定
        let skipReason: string | undefined;
        if (!keyToUse) {
          skipReason = "認証キーと顧客IDが両方とも空";
          stats.skipped++;
        } else if (!isTargetProduct) {
          skipReason = `商品名が「トラブル解決ラボ」ではない（${productName}）`;
          stats.skipped++;
        } else {
          stats.filtered++;
        }

        // 抽出データに追加
        extractedData.push({
          rowNumber: i + 2, // ヘッダー行を考慮
          productName,
          authKey,
          customerId,
          phoneNumber,
          status,
          statusMapped: tokenStatus,
          keyToUse,
          isFiltered: isTargetProduct && !!keyToUse,
          skipReason,
        });
      } catch (error: any) {
        extractedData.push({
          rowNumber: i + 2,
          productName: "",
          authKey: "",
          customerId: "",
          phoneNumber: "",
          status: "",
          statusMapped: "UNUSED",
          keyToUse: "",
          isFiltered: false,
          skipReason: `エラー: ${error.message || "不明なエラー"}`,
        });
        console.error(`行${i + 2}の処理エラー:`, error);
      }
    }

    console.log("✅ 抽出完了:", stats);

    return NextResponse.json({
      success: true,
      message: `CSV解析が完了しました（DB登録なし）`,
      stats,
      extractedData,
    });
  } catch (error: any) {
    console.error("❌ CSVインポートエラー:", error);
    return NextResponse.json(
      {
        error: "CSVインポート中にエラーが発生しました",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
