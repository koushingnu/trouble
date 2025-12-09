"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { HeartIcon } from "@heroicons/react/24/outline";
import { Message } from "@/types/chat";

interface TroubleChatProps {
  initialChatRoomId?: number | null;
}

export default function NewTroubleChat({
  initialChatRoomId = null,
}: TroubleChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(
    initialChatRoomId
  );
  const [chatStatus, setChatStatus] = useState<
    "IN_PROGRESS" | "RESOLVED" | "ESCALATED"
  >("IN_PROGRESS");
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!chatRoomId) {
      setChatStatus("IN_PROGRESS");
    }
  }, [chatRoomId]);

  useEffect(() => {
    setChatRoomId(initialChatRoomId);
    if (initialChatRoomId === null) {
      setMessages([]);
    }
  }, [initialChatRoomId]);

  const scrollToBottom = () => {
    if (typeof window === "undefined") return;
    
    try {
      if (messagesEndRef.current) {
        const element = messagesEndRef.current;
        const parent = element.parentElement;
        if (parent) {
          parent.scrollTop = parent.scrollHeight;
        }
      }
    } catch (error) {
      console.error("Scroll error:", error);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  // チャット履歴をロード
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return; // SSR対策
    
    const loadChatHistory = async () => {
      if (!chatRoomId || !session?.user) {
        return;
      }

      try {
        const [historyResponse, roomResponse] = await Promise.all([
          fetch(`/api/chat/history?chatRoomId=${chatRoomId}`, {
            headers: { "Cache-Control": "no-cache" },
          }),
          fetch(`/api/chat/rooms/${chatRoomId}`, {
            headers: { "Cache-Control": "no-cache" },
          }),
        ]);

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.success && historyData.data) {
            setMessages(historyData.data);
          }
        }

        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          if (roomData.success && roomData.data) {
            setChatStatus(roomData.data.status);
          }
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [chatRoomId, session?.user, mounted]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputMessage.trim() || isLoading || chatStatus === "RESOLVED") return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // ユーザーメッセージを即座に表示
    const tempUserMessage: Message = {
      id: Date.now(),
      sender: "user",
      body: userMessage,
      created_at: new Date().toISOString(),
      chat_room_id: chatRoomId || 0,
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatRoomId: chatRoomId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // チャットルームIDを保存
        if (data.data.chatRoomId && !chatRoomId) {
          setChatRoomId(data.data.chatRoomId);
        }

        // アシスタントの応答を追加
        const assistantMessage: Message = {
          id: Date.now() + 1,
          sender: "assistant",
          body: data.data.message,
          created_at: new Date().toISOString(),
          chat_room_id: data.data.chatRoomId,
        };
        setMessages((prev) => [...prev.slice(0, -1), tempUserMessage, assistantMessage]);
      } else {
        throw new Error(data.error || "メッセージ送信に失敗しました");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("メッセージの送信に失敗しました");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!chatRoomId) return;

    try {
      const response = await fetch(`/api/chat/rooms/${chatRoomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });

      const data = await response.json();
      if (data.success) {
        setChatStatus("RESOLVED");
        alert("相談を解決済みにしました");
      }
    } catch (error) {
      console.error("Error resolving chat:", error);
      alert("解決済みにできませんでした");
    }
  };

  return (
    <div className="bg-[#FDFDFD] rounded-3xl shadow-lg overflow-hidden flex flex-col h-[calc(100vh-220px)] md:h-[600px] max-h-[calc(100vh-220px)]">
      {/* ヘッダー */}
      <div className="bg-[#FDFDFD] px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">相談する</h2>
        {chatStatus === "IN_PROGRESS" && messages.length > 0 && (
          <button
            onClick={handleResolve}
            className="flex items-center gap-1 text-[#FF7BAC] border border-[#FF7BAC] rounded-full px-4 py-1 text-sm hover:bg-[#FFE4F1] transition-colors"
          >
            <HeartIcon className="w-4 h-4" />
            <span>解決済みにする</span>
          </button>
        )}
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm mb-4">お困りのトラブルについて、</p>
            <p className="text-sm mb-4">以下の入力欄からお気軽に</p>
            <p className="text-sm">相談ください。</p>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.sender === "user";
          const showDate =
            index === 0 ||
            new Date(messages[index - 1].created_at).toDateString() !==
              new Date(message.created_at).toDateString();

          return (
            <div key={message.id}>
              {/* 日付表示 */}
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    {new Date(message.created_at).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {/* メッセージ */}
              <div
                className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                      src="/assistant.png"
                      alt="アシスタント"
                      className="w-8 h-8 object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? "bg-[#1888CF] text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 入力エリア */}
      <div className="bg-[#FDFDFD] px-4 py-3 border-t border-gray-200 flex-shrink-0">
        <form 
          onSubmit={handleSendMessage} 
          className="flex items-center gap-2"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading || chatStatus === "RESOLVED"}
            placeholder={
              chatStatus === "RESOLVED"
                ? "この相談は解決済みです"
                : "相談内容を入力してください"
            }
            className="flex-1 min-w-0 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1888CF] disabled:bg-gray-100 disabled:text-gray-400 touch-manipulation"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim() || chatStatus === "RESOLVED"}
            className="flex-shrink-0 bg-[#1888CF] text-white p-2.5 rounded-lg hover:bg-[#1568a8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

