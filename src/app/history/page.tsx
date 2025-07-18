"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChatRoom } from "@/types/chat";
import { APIResponse } from "@/types/chat";

export default function HistoryPage() {
  const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/proxy/chat/history", {
          headers: {
            Authorization: `Bearer ${session.user.token || ""}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch chat rooms");
        }

        const data: APIResponse<{ chatRooms: ChatRoom[] }> =
          await response.json();
        if (data.success && data.data) {
          setChatRooms(data.data.chatRooms);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRooms();
  }, [session?.user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="page-title">相談履歴</h1>
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
        <h1 className="page-title">相談履歴</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="divide-y divide-gray-200">
          {chatRooms.length === 0 ? (
            <div className="p-6">
              <p className="text-center text-gray-500">相談履歴はありません</p>
            </div>
          ) : (
            chatRooms.map((chatRoom) => {
              const firstMessage = chatRoom.messages[0];
              const isResolved = chatRoom.messages.some(
                (msg) =>
                  msg.sender === "assistant" &&
                  msg.body.includes("解決いたしました")
              );

              return (
                <div
                  key={chatRoom.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-medium text-gray-900 truncate">
                          {firstMessage?.body || "無題の相談"}
                        </h2>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isResolved
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {isResolved ? "解決済み" : "対応中"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {firstMessage?.body || ""}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {new Date(chatRoom.created_at).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                        <span>・</span>
                        <span>{chatRoom.messages.length}件のメッセージ</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/consultation/${chatRoom.id}`}
                        className="inline-flex items-center px-4 py-2 border border-sky-600 text-sm font-medium rounded-md text-sky-600 bg-white hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                      >
                        チャットを表示
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
