import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CheckRecord {
  authKey: string;
  status: "ACTIVE" | "REVOKED" | "UNUSED";
  registeredDate?: string;
  cancelledDate?: string;
}

export async function POST(req: NextRequest) {
  try {
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

    const { records } = await req.json() as { records: CheckRecord[] };

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 対象トークンをDB一括取得
    const authKeys = records.map((r) => r.authKey).filter(Boolean);
    const existingTokens = await prisma.token.findMany({
      where: { token_value: { in: authKeys } },
      select: {
        token_value: true,
        status: true,
        registered_at: true,
        cancelled_at: true,
      },
    });

    const tokenMap = new Map(existingTokens.map((t) => [t.token_value, t]));

    const results = records.map((record) => {
      const existing = tokenMap.get(record.authKey);

      if (!existing) {
        return { authKey: record.authKey, action: "create" as const };
      }

      // ステータス変更チェック
      if (existing.status !== record.status) {
        return { authKey: record.authKey, action: "update" as const };
      }

      // 登録日変更チェック
      if (record.registeredDate) {
        const newDate = new Date(record.registeredDate).toDateString();
        const existingDate = existing.registered_at?.toDateString() ?? null;
        if (newDate !== existingDate) {
          return { authKey: record.authKey, action: "update" as const };
        }
      }

      // 退会日変更チェック（REVOKED の場合）
      if (record.cancelledDate && record.status === "REVOKED") {
        const dateStr = record.cancelledDate.replace(/\//g, "-");
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
          const newCancelDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]),
            0
          ).toDateString();
          const existingCancelDate =
            existing.cancelled_at?.toDateString() ?? null;
          if (newCancelDate !== existingCancelDate) {
            return { authKey: record.authKey, action: "update" as const };
          }
        }
      }

      return { authKey: record.authKey, action: "skip" as const };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Check error:", error);
    return NextResponse.json(
      { error: "チェック中にエラーが発生しました", details: error.message },
      { status: 500 }
    );
  }
}
