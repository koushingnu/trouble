import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log("\n=== User Details API Start ===");
    const token = await getToken({ req: request });
    if (!token) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User ID:", token.id);

    // ユーザー情報を取得（メッセージは取得しない）
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(token.id, 10),
      },
      select: {
        id: true,
        email: true,
        is_admin: true,
        created_at: true,
        last_name: true,
        first_name: true,
        phone_number: true,
      },
    });

    if (!user) {
      console.log("User not found");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    console.log("User found:", {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin,
      created_at: user.created_at,
    });

    // チャットルームの統計を効率的に集計（count()使用）
    const [chatRoomsCount, resolvedCount, inProgressCount, escalatedCount] = await Promise.all([
      prisma.chatRoom.count({
        where: { user_id: user.id },
      }),
      prisma.chatRoom.count({
        where: { user_id: user.id, status: "RESOLVED" },
      }),
      prisma.chatRoom.count({
        where: { user_id: user.id, status: "IN_PROGRESS" },
      }),
      prisma.chatRoom.count({
        where: { user_id: user.id, status: "ESCALATED" },
      }),
    ]);

    console.log("Chat statistics:", {
      total: chatRoomsCount,
      resolved: resolvedCount,
      inProgress: inProgressCount,
      escalated: escalatedCount,
    });

    const response = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at.toISOString(),
        last_name: user.last_name,
        first_name: user.first_name,
        phone_number: user.phone_number,
        chat_rooms_count: chatRoomsCount,
        resolved_count: resolvedCount,
        in_progress_count: inProgressCount,
        escalated_count: escalatedCount,
      },
    };

    console.log("Response:", response);
    console.log("=== User Details API End ===");

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user details" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
