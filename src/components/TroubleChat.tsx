"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/outline";
import { Message } from "@/types/chat";

// メッセージをグループ化する関数
function groupMessagesByDate(messages: Message[]) {
  const groups: { [key: string]: Message[] } = {};

  messages.forEach((message) => {
    const date = new Date(message.created_at).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
  });

  return groups;
}

export default function TroubleChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新規相談ページマウント時にチャットルームIDをクリア
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/consultation/new") {
      console.log(
        "[DEBUG] Clearing chat room ID on new consultation page mount"
      );
      localStorage.removeItem("currentChatRoomId");
      setChatRoomId(null);
      setMessages([]);
    } else {
      // 詳細表示の場合はローカルストレージからチャットルームIDを復元
      const storedChatRoomId = localStorage.getItem("currentChatRoomId");
      if (storedChatRoomId) {
        console.log(
          "[DEBUG] Restored chat room ID from storage:",
          storedChatRoomId
        );
        setChatRoomId(parseInt(storedChatRoomId, 10));
      }
    }
  }, []); // 空の依存配列でマウント時のみ実行

  // チャットルームIDが変更されたらローカルストレージに保存
  useEffect(() => {
    if (chatRoomId) {
      console.log("[DEBUG] Saving chat room ID to storage:", chatRoomId);
      localStorage.setItem("currentChatRoomId", chatRoomId.toString());
    }
  }, [chatRoomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 全画面モード切り替え時のスクロール位置調整
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [isFullScreen]);

  // チャットルームIDが変更されたときに履歴を読み込む
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chatRoomId || !session?.user) return;

      try {
        console.log("[DEBUG] Loading chat history for room:", chatRoomId);
        const response = await fetch(
          `/api/chat/history?chatRoomId=${chatRoomId}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.token || ""}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[DEBUG] Chat history fetch failed:", errorText);
          throw new Error(`Failed to load chat history: ${errorText}`);
        }

        const data = await response.json();
        console.log("[DEBUG] Chat history loaded:", {
          messageCount: data.data.messages.length,
          messages: data.data.messages.map((m: Message) => ({
            sender: m.sender,
            body: m.body.substring(0, 50) + (m.body.length > 50 ? "..." : ""),
            created_at: m.created_at,
          })),
        });

        if (data.success && data.data.messages) {
          setMessages(data.data.messages);
        }
      } catch (error) {
        console.error("[DEBUG] Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [chatRoomId, session?.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !session?.user) return;

    const newMessage: Message = {
      id: Date.now(),
      chat_room_id: chatRoomId || 0,
      sender: "user",
      body: inputMessage.trim(),
      created_at: new Date().toISOString(),
    };

    console.log("[DEBUG] Sending new message:", {
      message: inputMessage.trim(),
      chatRoomId,
      messageCount: messages.length,
      currentMessages: messages.map((m) => ({
        sender: m.sender,
        body: m.body.substring(0, 30) + "...",
      })),
    });

    // 一時的にメッセージを表示
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          chatRoomId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[DEBUG] API error response:", errorText);
        throw new Error("API request failed");
      }

      const data = await response.json();
      console.log("[DEBUG] API response:", {
        success: data.success,
        chatRoomId: data.data.chatRoomId,
        messageLength: data.data.message.length,
      });

      if (data.success) {
        // 一時的なメッセージを本物に置き換え、アシスタントの応答を追加
        setMessages((prev) => [
          ...prev.slice(0, -1), // 一時的なメッセージを除外
          {
            id: Date.now(),
            chat_room_id: chatRoomId || 0,
            sender: "user",
            body: inputMessage.trim(),
            created_at: new Date().toISOString(),
          },
          {
            id: Date.now() + 1,
            chat_room_id: chatRoomId || 0,
            sender: "assistant",
            body: data.data.message,
            created_at: new Date().toISOString(),
          },
        ]);

        if (!chatRoomId && data.data.chatRoomId) {
          console.log(
            "[DEBUG] Setting new chat room ID:",
            data.data.chatRoomId
          );
          setChatRoomId(data.data.chatRoomId);
        }
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("[DEBUG] Error sending message:", error);
      setMessages((prev) => prev.slice(0, -1)); // 一時的なメッセージを削除
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out ${
        isFullScreen
          ? "fixed inset-0 z-50 rounded-none flex flex-col"
          : "relative"
      }`}
    >
      {/* チャットヘッダー */}
      <div
        className={`bg-sky-600 px-6 py-4 ${isFullScreen ? "shadow-md" : ""}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
            <h2 className="text-xl font-semibold text-white">
              トラブル相談チャット
            </h2>
          </div>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="text-white hover:text-white/80 transition-colors p-2 hover:bg-sky-500/50 rounded-lg"
            aria-label={isFullScreen ? "全画面解除" : "全画面表示"}
          >
            {isFullScreen ? (
              <ArrowsPointingInIcon className="h-5 w-5" />
            ) : (
              <ArrowsPointingOutIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-1 text-sm text-white/90">
          {messages.length === 0
            ? "トラブルの内容を入力してください"
            : `${messages.length}件のメッセージ`}
        </p>
      </div>

      {/* メッセージ表示エリア */}
      <div
        className={`overflow-y-auto px-4 sm:px-6 py-6 bg-gray-50 ${
          isFullScreen ? "flex-1" : "h-[500px]"
        }`}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <ChatBubbleLeftIcon className="h-8 w-8" />
            <p>メッセージはまだありません</p>
            <p className="text-sm">
              下のフォームからメッセージを送信してください
            </p>
          </div>
        ) : (
          <div
            className={`space-y-12 ${isFullScreen ? "max-w-7xl mx-auto w-full px-4" : ""}`}
          >
            {Object.entries(groupMessagesByDate(messages)).map(
              ([date, dateMessages]) => (
                <div key={date} className="space-y-8">
                  <div className="flex justify-center">
                    <div className="bg-white px-4 py-1.5 rounded-full text-sm text-gray-500 shadow-sm border border-gray-100">
                      {date}
                    </div>
                  </div>
                  {dateMessages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`space-y-1 ${
                        isFullScreen &&
                        index > 0 &&
                        dateMessages[index - 1]?.sender !== message.sender
                          ? "mt-12"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex items-start ${
                          message.sender === "user"
                            ? "flex-row-reverse space-x-reverse"
                            : "flex-row"
                        } ${isFullScreen ? "space-x-6" : "space-x-2"}`}
                      >
                        {/* アイコン */}
                        <div className="flex-shrink-0">
                          {message.sender === "user" ? (
                            <div
                              className={`relative ${isFullScreen ? "w-12 h-12" : "w-11 h-11"}`}
                            >
                              <div className="absolute inset-0 bg-sky-600 rounded-full shadow-lg"></div>
                              <div className="absolute inset-[2px] bg-white rounded-full flex items-center justify-center">
                                <svg
                                  className={`${isFullScreen ? "w-8 h-8" : "w-7 h-7"} text-sky-600`}
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`relative ${isFullScreen ? "w-12 h-12" : "w-11 h-11"}`}
                            >
                              <div className="absolute inset-0 bg-sky-500 rounded-full shadow-md"></div>
                              <div className="absolute inset-[2px] bg-white rounded-full flex items-center justify-center overflow-hidden">
                                <svg
                                  className={`${isFullScreen ? "w-8 h-8" : "w-7 h-7"}`}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  {/* ロボットの頭部 */}
                                  <path
                                    d="M12 4C14.8 4 17 6.2 17 9V10.5H7V9C7 6.2 9.2 4 12 4Z"
                                    fill="currentColor"
                                    className="text-sky-500"
                                  />
                                  {/* アンテナ */}
                                  <path
                                    d="M12 1.5V3.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="text-sky-600"
                                  />
                                  {/* 目 */}
                                  <circle
                                    cx="9.5"
                                    cy="7"
                                    r="1.25"
                                    fill="currentColor"
                                    className="text-white"
                                  />
                                  <circle
                                    cx="14.5"
                                    cy="7"
                                    r="1.25"
                                    fill="currentColor"
                                    className="text-white"
                                  />
                                  {/* 本体 */}
                                  <path
                                    d="M4.5 11C4.5 10.4477 4.94772 10 5.5 10H18.5C19.0523 10 19.5 10.4477 19.5 11V17.5C19.5 19.1569 18.1569 20.5 16.5 20.5H7.5C5.84315 20.5 4.5 19.1569 4.5 17.5V11Z"
                                    fill="currentColor"
                                    className="text-sky-500"
                                  />
                                  {/* 口/スピーカー */}
                                  <path
                                    d="M8.5 14H15.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="text-white"
                                  />
                                  <path
                                    d="M8.5 16.5H15.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="text-white"
                                  />
                                </svg>
                              </div>
                              <div className="absolute inset-0 bg-sky-100/50 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>

                        {/* メッセージ */}
                        <div
                          className={`rounded-2xl px-6 py-4 shadow-sm ${
                            message.sender === "user"
                              ? "bg-sky-600 text-white rounded-tr-none max-w-[700px]"
                              : "bg-white border border-gray-100 rounded-tl-none max-w-[700px]"
                          }`}
                        >
                          <p
                            className={`whitespace-pre-wrap break-words leading-relaxed tracking-wide ${
                              isFullScreen ? "text-base" : "text-[15px]"
                            }`}
                          >
                            {message.body}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`${
                          message.sender === "user" ? "text-right" : "text-left"
                        } px-12`}
                      >
                        <p className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* 入力フォーム */}
      <div
        className={`border-t border-gray-100 bg-white ${
          isFullScreen ? "px-6 py-6 shadow-lg" : "p-4"
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className={`flex space-x-4 ${
            isFullScreen ? "max-w-5xl mx-auto" : ""
          }`}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className={`flex-1 rounded-xl border border-gray-200 px-4 ${
              isFullScreen ? "py-3.5 text-base" : "py-2 text-[15px]"
            } focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white shadow-sm`}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className={`bg-sky-600 text-white rounded-xl px-8 ${
              isFullScreen ? "py-3.5 text-base" : "py-2 text-[15px]"
            } hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm transition-colors duration-200`}
          >
            <span>送信</span>
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
