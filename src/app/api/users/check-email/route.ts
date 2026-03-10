import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "メールアドレスが必要です" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "メールアドレスの確認中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
