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

    // ユーザー情報を取得
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(token.id, 10),
      },
      include: {
        chat_rooms: {
          include: {
            messages: {
              orderBy: {
                created_at: "desc",
              },
              take: 1,
            },
          },
        },
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
      chat_rooms_count: user.chat_rooms.length,
    });

    // チャットルームの統計を計算
    const chatRoomsCount = user.chat_rooms.length;
    const resolvedCount = user.chat_rooms.filter(
      (room) => room.status === "RESOLVED"
    ).length;
    const inProgressCount = user.chat_rooms.filter(
      (room) => room.status === "IN_PROGRESS"
    ).length;
    const escalatedCount = user.chat_rooms.filter(
      (room) => room.status === "ESCALATED"
    ).length;

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
