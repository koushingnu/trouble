import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ImportRecord {
  authKey: string;
  phoneNumber: string;
  status: "ACTIVE" | "REVOKED" | "UNUSED";
  cancelledDate?: string;
  registeredDate?: string;
}

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

    // リクエストボディから登録データを取得
    const { records } = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "登録するレコードがありません" },
        { status: 400 }
      );
    }

    console.log(`📦 登録開始: ${records.length}件`);

    // 結果統計
    const results = {
      total: records.length,
      success: 0,
      failed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      phoneUpdated: 0,
      errors: [] as Array<{ authKey: string; error: string }>,
    };

    // 各レコードを個別に処理（エラーが発生しても他のレコードを処理）
    for (const record of records as ImportRecord[]) {
      try {
        const { authKey, phoneNumber, status, cancelledDate, registeredDate } = record;

        if (!authKey) {
          results.failed++;
          results.errors.push({
            authKey: "不明",
            error: "認証キーが空です",
          });
          continue;
        }

        // トークンの存在確認
        const existingToken = await prisma.token.findUnique({
          where: { token_value: authKey },
          include: {
            assigned_user: {
              select: {
                id: true,
                phone_number: true,
              },
            },
          },
        });

        if (existingToken) {
          // 既存トークンの処理
          // 登録日をDateオブジェクトに変換（YYYY-MM-DD形式）
          let registeredAtDate: Date | null = null;
          if (registeredDate) {
            try {
              registeredAtDate = new Date(registeredDate);
            } catch (error) {
              console.warn(`⚠️  登録日の解析失敗: ${registeredDate}`);
            }
          }

          // 退会日をDateオブジェクトに変換（年月形式 YYYY/MM または YYYY-MM）
          let cancelledAtDate: Date | null = null;
          if (cancelledDate && status === "REVOKED") {
            try {
              // YYYY/MM または YYYY-MM 形式を想定
              const dateStr = cancelledDate.replace(/\//g, "-");
              const [year, month] = dateStr.split("-");
              if (year && month) {
                // 月の最終日を設定
                cancelledAtDate = new Date(parseInt(year), parseInt(month), 0);
              }
            } catch (error) {
              console.warn(`⚠️  退会日の解析失敗: ${cancelledDate}`);
            }
          }

          // ステータス、登録日、または退会日が変更された場合のみ更新
          const needsUpdate = 
            existingToken.status !== status || 
            (registeredAtDate && (!existingToken.registered_at || 
              existingToken.registered_at.getTime() !== registeredAtDate.getTime())) ||
            (cancelledAtDate && (!existingToken.cancelled_at || 
              existingToken.cancelled_at.getTime() !== cancelledAtDate.getTime()));

          if (needsUpdate) {
            await prisma.token.update({
              where: { token_value: authKey },
              data: { 
                status,
                registered_at: registeredAtDate,
                cancelled_at: cancelledAtDate,
              },
            });
            results.updated++;
            console.log(`✅ 更新: ${authKey} → ステータス: ${status}${registeredAtDate ? `, 登録日: ${registeredAtDate.toISOString().split('T')[0]}` : ''}${cancelledAtDate ? `, 退会日: ${cancelledAtDate.toISOString().split('T')[0]}` : ''}`);
          } else {
            results.skipped++;
            console.log(`⏭️  スキップ: ${authKey} → 変更なし (${status})`);
          }

          // 電話番号の更新（ユーザーが存在し、電話番号が未設定の場合のみ）
          if (
            existingToken.assigned_user &&
            phoneNumber &&
            !existingToken.assigned_user.phone_number
          ) {
            await prisma.user.update({
              where: { id: existingToken.assigned_user.id },
              data: { phone_number: phoneNumber },
            });
            results.phoneUpdated++;
            console.log(`📞 電話番号更新: ${authKey} → ${phoneNumber}`);
          }
        } else {
          // 新規トークンの作成
          await prisma.token.create({
            data: {
              token_value: authKey,
              status,
            },
          });
          results.created++;
          console.log(`🆕 新規作成: ${authKey} → ${status}`);
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          authKey: record.authKey || "不明",
          error: error.message || "不明なエラー",
        });
        console.error(`❌ エラー: ${record.authKey}`, error);
      }
    }

    console.log("✅ 登録完了:", results);

    return NextResponse.json({
      success: true,
      message: `登録が完了しました（成功: ${results.success}件、失敗: ${results.failed}件）`,
      results,
    });
  } catch (error: any) {
    console.error("❌ CSV登録エラー:", error);
    return NextResponse.json(
      {
        error: "CSV登録中にエラーが発生しました",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
