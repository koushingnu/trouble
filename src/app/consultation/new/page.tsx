"use client";

import { useEffect, useState } from "react";
import NewTroubleChat from "../../../components/NewTroubleChat";
import { useSession } from "next-auth/react";
import { APIResponse, ChatRoom } from "@/types/chat";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function NewConsultationPage() {
  const { data: session } = useSession();
  const [latestChatRoom, setLatestChatRoom] = useState<ChatRoom | null>(null);
  const [isLoadingChatRooms, setIsLoadingChatRooms] = useState(true);
  const [isNewChat, setIsNewChat] = useState(false);

  useEffect(() => {
    const fetchLatestChatRoom = async () => {
      if (!session?.user) {
        setIsLoadingChatRooms(false);
        return;
      }

      try {
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

        if (data.success && data.data && data.data.length > 0) {
          setLatestChatRoom(data.data[0]);
          setIsNewChat(false);
        } else {
          setIsNewChat(true);
        }
      } catch (error) {
        console.error("Error fetching latest chat:", error);
        setIsNewChat(true);
      } finally {
        setIsLoadingChatRooms(false);
      }
    };

    fetchLatestChatRoom();
  }, [session?.user]);

  if (isLoadingChatRooms) {
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
      <div className="max-w-md mx-auto px-4 py-6">
        <NewTroubleChat
          initialChatRoomId={isNewChat ? null : latestChatRoom?.id || null}
        />
      </div>
    </AuthenticatedLayout>
  );
}
