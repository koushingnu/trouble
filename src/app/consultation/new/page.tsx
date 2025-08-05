"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import TroubleChat from "../../../components/TroubleChat";
import { ChatRoom } from "@/types/chat";

export default function NewConsultationPage() {
  const { data: session } = useSession();
  const [latestChatRoom, setLatestChatRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewChat, setIsNewChat] = useState(false);

  useEffect(() => {
    const fetchLatestChat = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/chat/rooms", {
          headers: {
            Authorization: `Bearer ${session.user.token || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chat rooms");
        }

        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          // 最新のチャットルームを取得（created_atで降順ソート）
          const sortedRooms = data.data.sort(
            (a: ChatRoom, b: ChatRoom) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          setLatestChatRoom(sortedRooms[0]);
        } else {
          // チャット履歴がない場合は新規チャットモードに
          setIsNewChat(true);
        }
      } catch (error) {
        console.error("Error fetching latest chat:", error);
        setIsNewChat(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestChat();
  }, [session?.user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="page-title">相談する</h1>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <p className="text-center text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">相談する</h1>
            <p className="mt-2 text-sm text-gray-600">
              {isNewChat
                ? "トラブルについて、お気軽にご相談ください。専門のスタッフが丁寧に対応させていただきます。"
                : "前回の相談を続けることができます。新しい相談を始めたい場合は、右の「新規相談を始める」ボタンをクリックしてください。"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isNewChat && latestChatRoom ? (
              <button
                onClick={() => setIsNewChat(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors gap-2"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                前回の相談に戻る
              </button>
            ) : null}
            {!isNewChat && latestChatRoom && (
              <button
                onClick={() => setIsNewChat(true)}
                className="inline-flex items-center px-4 py-2 border border-sky-600 text-sm font-medium rounded-md text-sky-600 bg-white hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                新規相談を始める
              </button>
            )}
          </div>
        </div>
      </div>

      <TroubleChat
        initialChatRoomId={
          !isNewChat && latestChatRoom ? latestChatRoom.id : null
        }
      />
    </div>
  );
}
