"use client";

import { useEffect, useState } from "react";
import TroubleChat from "../../../components/TroubleChat";
import { useSession } from "next-auth/react";
import { APIResponse, ChatRoom } from "@/types/chat";
import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

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
        console.log("Fetching chat rooms...");
        const response = await fetch("/api/chat/rooms", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error fetching latest chat:", errorText);
          throw new Error("Failed to fetch chat rooms");
        }

        const data: APIResponse<ChatRoom[]> = await response.json();
        console.log("Fetched chat rooms data:", data);

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

  const pageTitle = isNewChat ? "新規相談" : "相談する";
  const pageDescription = isNewChat
    ? "新しいトラブルについて、お気軽にご相談ください。"
    : "前回の相談を続けます。";

  if (isLoadingChatRooms) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="page-title">相談する</h1>
          <p className="mt-4 text-sm text-gray-600">読み込み中...</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center text-gray-500">
          チャット履歴を読み込んでいます...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="mt-4 text-sm text-gray-600">{pageDescription}</p>
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

      <TroubleChat initialChatRoomId={isNewChat ? null : latestChatRoom?.id || null} />
    </div>
  );
}