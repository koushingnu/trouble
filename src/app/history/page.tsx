"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChatRoom, APIResponse } from "@/types/chat";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { ChevronLeftIcon, Bars3Icon } from "@heroicons/react/24/outline";

type FilterType = "all" | "resolved" | "in_progress" | "escalated";

export default function HistoryPage() {
  const { data: session } = useSession();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<"summary" | "list">("summary");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("all");

    const fetchChatRooms = async () => {
      if (!session?.user) return;

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
        if (data.success && data.data) {
          const sortedChatRooms = data.data.sort(
            (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setChatRooms(sortedChatRooms);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchChatRooms();
    const interval = setInterval(fetchChatRooms, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  // 統計を計算
  const stats = {
    all: chatRooms.length,
    resolved: chatRooms.filter((room) => room.status === "RESOLVED").length,
    in_progress: chatRooms.filter((room) => room.status === "IN_PROGRESS")
      .length,
    escalated: chatRooms.filter((room) => room.status === "ESCALATED").length,
  };

  // フィルター適用
  const filteredChatRooms = chatRooms.filter((room) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "resolved") return room.status === "RESOLVED";
    if (selectedFilter === "in_progress") return room.status === "IN_PROGRESS";
    if (selectedFilter === "escalated") return room.status === "ESCALATED";
    return true;
  });

  const filterConfig = {
    all: {
      label: "すべて",
      bgColor: "bg-[#E3F2FD]",
      textColor: "text-[#1888CF]",
      count: stats.all,
    },
    resolved: {
      label: "解決済み",
      bgColor: "bg-[#E8E8E8]",
      textColor: "text-[#1888CF]",
      count: stats.resolved,
    },
    in_progress: {
      label: "相談中",
      bgColor: "bg-[#FFF9C4]",
      textColor: "text-[#1888CF]",
      count: stats.in_progress,
    },
    escalated: {
      label: "電話相談",
      bgColor: "bg-[#FFE4F1]",
      textColor: "text-[#1888CF]",
      count: stats.escalated,
    },
  };

  const statusBadgeConfig = {
    IN_PROGRESS: {
      label: "相談中",
      bgColor: "bg-[#FFF9C4]",
      textColor: "text-[#1888CF]",
    },
    RESOLVED: {
      label: "解決済み",
      bgColor: "bg-[#E8E8E8]",
      textColor: "text-[#1888CF]",
    },
    ESCALATED: {
      label: "電話相談",
      bgColor: "bg-[#FFE4F1]",
      textColor: "text-[#1888CF]",
    },
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-6">
          <p className="text-center text-gray-500">読み込み中...</p>
        </div>
      </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-6">
          {/* サマリー画面 */}
          {currentView === "summary" && (
            <>
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                相談履歴
              </h1>
              <div className="space-y-3">
                {Object.entries(filterConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedFilter(key as FilterType);
                      setCurrentView("list");
                    }}
                    className={`w-full ${config.bgColor} rounded-2xl p-4 flex items-center justify-between hover:opacity-80 transition-opacity`}
                  >
                    <span className={`font-bold text-lg ${config.textColor}`}>
                      {config.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${config.textColor}`}>
                        {config.count}件
                      </span>
                      <Bars3Icon className={`w-6 h-6 ${config.textColor}`} />
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* リスト画面 */}
          {currentView === "list" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentView("summary")}
                  className="flex items-center gap-1 text-[#1888CF]"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                  <span className="font-bold">
                    {filterConfig[selectedFilter].label}
                  </span>
                </button>
                <span className="text-[#1888CF] text-lg font-bold">
                  {filteredChatRooms.length}件
                </span>
      </div>

              <div className="space-y-3">
                {filteredChatRooms.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    該当する相談はありません
                  </p>
          ) : (
                  filteredChatRooms.map((chatRoom) => {
                    const status = chatRoom.status || "IN_PROGRESS";
                    const statusConfig = statusBadgeConfig[status];

              return (
                <Link
                        key={chatRoom.id}
                  href={`/consultation/${chatRoom.id}`}
                        className="block border-2 border-[#1888CF] rounded-2xl p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-gray-600 mb-1">
                              相談日{" "}
                          {new Date(chatRoom.created_at).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                            }
                          )}
                            </p>
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {chatRoom.last_message || "タイトルタイトルタイトル"}
                            </p>
                      </div>
                          <div
                            className={`ml-3 px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bgColor} ${statusConfig.textColor} whitespace-nowrap`}
                          >
                            {statusConfig.label}
                    </div>
                  </div>
                </Link>
              );
            })
                )}
              </div>

              {/* ページネーション（仮） */}
              {filteredChatRooms.length > 0 && (
                <div className="mt-6 flex items-center justify-center gap-2 text-[#1888CF]">
                  <span className="font-bold">1/5</span>
                  <button className="text-2xl">&gt;</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
