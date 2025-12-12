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
  const [chatTitle, setChatTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
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
    if (Array.isArray(messages) && messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  // チャット履歴をロード
  useEffect(() => {
    if (!mounted || typeof window === "undefined") {
      console.log("[NewTroubleChat] Waiting for mount or window...", { mounted, hasWindow: typeof window !== "undefined" });
      return;
    }
    
    const loadChatHistory = async () => {
      if (!chatRoomId || !session?.user) {
        console.log("[NewTroubleChat] No chatRoomId or session, skipping history load", { chatRoomId, hasSession: !!session?.user });
        return;
      }

      console.log("[NewTroubleChat] Loading chat history for room:", chatRoomId);
      
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
          console.log("[NewTroubleChat] History API response:", historyData);
          if (historyData.success && historyData.data) {
            // APIは data.messages を返すので、messagesプロパティを取得
            const messagesList = historyData.data.messages || [];
            console.log("[NewTroubleChat] Loaded messages:", messagesList.length);
            setMessages(Array.isArray(messagesList) ? messagesList : []);
          }
        } else {
          console.error("[NewTroubleChat] History API failed:", historyResponse.status);
        }

        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          console.log("[NewTroubleChat] Room API response:", roomData);
          if (roomData.success && roomData.data) {
            console.log("[NewTroubleChat] Chat status:", roomData.data.status);
            setChatStatus(roomData.data.status);
            setChatTitle(roomData.data.title || "");
          }
        } else {
          console.error("[NewTroubleChat] Room API failed:", roomResponse.status);
        }
      } catch (error) {
        console.error("[NewTroubleChat] Error loading chat history:", error);
      }
    };

    loadChatHistory();
  }, [chatRoomId, session?.user, mounted]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inputMessage.trim() || isLoading) {
      console.log("[NewTroubleChat] Send blocked:", { hasMessage: !!inputMessage.trim(), isLoading, chatStatus });
      return;
    }

    const userMessage = inputMessage.trim();
    console.log("[NewTroubleChat] Sending message:", userMessage);
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
      console.log("[NewTroubleChat] Calling /api/chat with:", { message: userMessage, chatRoomId });
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatRoomId: chatRoomId,
        }),
      });

      const data = await response.json();
      console.log("[NewTroubleChat] Chat API response:", data);

      if (data.success) {
        // チャットルームIDを保存
        if (data.data.chatRoomId && !chatRoomId) {
          setChatRoomId(data.data.chatRoomId);
        }

        // タイトルが生成されていたら更新
        if (data.data.title) {
          setChatTitle(data.data.title);
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

  const handleToggleResolve = async () => {
    if (!chatRoomId) return;

    const newStatus = chatStatus === "RESOLVED" ? "IN_PROGRESS" : "RESOLVED";
    const confirmMessage = newStatus === "RESOLVED" 
      ? "この相談を解決済みにしますか？"
      : "この相談を対応中に戻しますか？";

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/chat/rooms/${chatRoomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        setChatStatus(newStatus);
        const successMessage = newStatus === "RESOLVED"
          ? "相談を解決済みにしました"
          : "相談を対応中に戻しました";
        alert(successMessage);
      }
    } catch (error) {
      console.error("Error toggling chat status:", error);
      alert("ステータスの変更に失敗しました");
    }
  };

  const handleNewChat = () => {
    // 新しいチャットを開始
    setChatRoomId(null);
    setMessages([]);
    setChatStatus("IN_PROGRESS");
    setChatTitle("");
    setIsEditingTitle(false);
  };

  const handleUpdateTitle = async () => {
    if (!chatRoomId || !chatTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const response = await fetch(`/api/chat/rooms/${chatRoomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: chatTitle.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setChatTitle(chatTitle.trim());
        setIsEditingTitle(false);
      } else {
        alert("タイトルの更新に失敗しました");
      }
    } catch (error) {
      console.error("Error updating title:", error);
      alert("タイトルの更新に失敗しました");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* ヘッダー */}
      <div className="bg-[#FDFDFD] px-4 py-3 flex-shrink-0 shadow-sm">
        {/* タイトル行 */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800">相談する</h2>
          <div className="flex items-center gap-2">
          {Array.isArray(messages) && messages.length > 0 && (
            <>
              {chatStatus === "IN_PROGRESS" && (
                <button
                  onClick={handleToggleResolve}
                  className="flex items-center gap-1 bg-white text-gray-700 border-2 border-gray-300 rounded-full px-4 py-1.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <HeartIcon className="w-4 h-4" />
                  <span>解決済み</span>
                </button>
              )}
              {chatStatus === "RESOLVED" && (
                <button
                  onClick={handleToggleResolve}
                  className="flex items-center gap-1 bg-white text-[#FF7BAC] border-2 border-[#FF7BAC] rounded-full px-4 py-1.5 text-sm hover:bg-[#FFE4F1] transition-colors cursor-pointer"
                >
                  <HeartIcon className="w-4 h-4 fill-current" />
                  <span>解決済み</span>
                </button>
              )}
            </>
          )}
          <button
            onClick={handleNewChat}
            className="flex items-center justify-center w-9 h-9 bg-white text-[#1888CF] border-2 border-[#1888CF] rounded-full hover:bg-[#f0f8ff] transition-colors"
            title="新しい相談を開始"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          </div>
        </div>
        
        {/* タイトル編集行 */}
        {chatTitle && Array.isArray(messages) && messages.length > 0 && (
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <>
                <input
                  type="text"
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUpdateTitle();
                    } else if (e.key === "Escape") {
                      setIsEditingTitle(false);
                    }
                  }}
                  className="flex-1 text-sm text-gray-500 border-b border-gray-300 focus:outline-none focus:border-[#1888CF] px-1 py-0.5"
                  autoFocus
                  maxLength={100}
                />
              </>
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors truncate max-w-full"
                title={chatTitle}
              >
                {chatTitle}
              </button>
            )}
          </div>
        )}
      </div>

      {/* メッセージエリア - 背景に直接表示 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-hide">
        {(!Array.isArray(messages) || messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <p className="text-base mb-3">お困りのトラブルについて、</p>
            <p className="text-base mb-3">以下の入力欄からお気軽に</p>
            <p className="text-base">相談ください。</p>
          </div>
        )}

        {Array.isArray(messages) && messages.map((message, index) => {
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
                  <span className="bg-white/80 text-gray-700 text-xs px-3 py-1 rounded-full shadow-sm">
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
                className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2 items-end`}
              >
                {!isUser && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
                    <img
                      src="/assistant.png"
                      alt="アシスタント"
                      className="w-8 h-8 object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    isUser
                      ? "bg-[#1888CF] text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  <p className="text-base whitespace-pre-wrap break-words leading-relaxed">
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
      <div className="bg-[#FDFDFD] px-4 py-3 flex-shrink-0 shadow-lg">
        <form 
          onSubmit={handleSendMessage} 
          className="flex items-center gap-2"
          onTouchStart={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            placeholder="相談内容を入力してください"
            className="flex-1 min-w-0 px-4 py-3 text-base border-2 border-gray-300 rounded-full focus:outline-none focus:border-[#1888CF] disabled:bg-gray-100 disabled:text-gray-400 touch-manipulation"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="flex-shrink-0 bg-[#1888CF] text-white p-3 rounded-full hover:bg-[#1568a8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation shadow-md"
            onTouchStart={(e) => e.stopPropagation()}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

