import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: "admin@test.com",
      },
      include: {
        token: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
