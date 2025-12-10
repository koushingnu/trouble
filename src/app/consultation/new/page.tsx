"use client";

import { useEffect, useState } from "react";
import NewTroubleChat from "../../../components/NewTroubleChat";
import { useSession } from "next-auth/react";
import { APIResponse, ChatRoom } from "@/types/chat";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function NewConsultationPage() {
  const { data: session, status } = useSession();
  const [latestChatRoom, setLatestChatRoom] = useState<ChatRoom | null>(null);
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(true);
  const [isNewChat, setIsNewChat] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || status === "loading") {
      console.log("[NewConsultationPage] Waiting for mount or session...", { mounted, status });
      return;
    }
    
    console.log("[NewConsultationPage] Starting fetch for chat rooms");
    
    const fetchLatestChatRoom = async () => {
      if (!session?.user) {
        console.log("[NewConsultationPage] No session user, setting new chat");
        setIsLoadingChatRooms(false);
        setIsNewChat(true);
        return;
      }

      try {
        console.log("[NewConsultationPage] Fetching /api/chat/rooms");
        const response = await fetch("/api/chat/rooms", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chat rooms");
        }

        const data: APIResponse<ChatRoom[]> = await response.json();
        console.log("[NewConsultationPage] API Response:", data);

        if (data.success && data.data && data.data.length > 0) {
          console.log("[NewConsultationPage] Found chat room:", data.data[0].id);
          setLatestChatRoom(data.data[0]);
          setIsNewChat(false);
        } else {
          console.log("[NewConsultationPage] No chat rooms, setting new chat");
          setIsNewChat(true);
        }
      } catch (error) {
        console.error("[NewConsultationPage] Error fetching latest chat:", error);
        setIsNewChat(true);
      } finally {
        setIsLoadingChatRooms(false);
      }
    };

    fetchLatestChatRoom();
  }, [session?.user, status, mounted]);

  if (!mounted || isLoadingChatRooms) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-6 text-center text-gray-500">
            読み込み中...
        </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="h-full">
        <NewTroubleChat
          initialChatRoomId={isNewChat ? null : latestChatRoom?.id || null}
        />
      </div>
    </AuthenticatedLayout>
  );
}
