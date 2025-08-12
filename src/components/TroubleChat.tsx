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

// メッセージを日付でグループ化する関数
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

interface TroubleChatProps {
  initialChatRoomId?: number | null;
}

export default function TroubleChat({
  initialChatRoomId = null,
}: TroubleChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(
    initialChatRoomId
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chatRoomId based on prop
  useEffect(() => {
    console.log(
      "[DEBUG] TroubleChat mounted with initialChatRoomId:",
      initialChatRoomId
    );
    setChatRoomId(initialChatRoomId);
    if (initialChatRoomId === null) {
      setMessages([]); // Clear messages if starting a new chat
    }
  }, [initialChatRoomId]); // Re-run when initialChatRoomId changes

  // Save chatRoomId to localStorage
  useEffect(() => {
    if (chatRoomId) {
      console.log("[DEBUG] Saving chat room ID to storage:", chatRoomId);
      localStorage.setItem("currentChatRoomId", chatRoomId.toString());
    } else {
      localStorage.removeItem("currentChatRoomId");
    }
  }, [chatRoomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [isFullScreen]);

  // Load chat history when chatRoomId changes
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chatRoomId || !session?.user) {
        console.log(
          "[DEBUG] Skipping chat history load: chatRoomId or session missing."
        );
        return;
      }

      try {
        console.log("[DEBUG] Loading chat history for room:", chatRoomId);
        const response = await fetch(
          `/api/chat/history?chatRoomId=${chatRoomId}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
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
          success: data.success,
          messageCount: data.data?.messages?.length,
        });

        if (data.success && data.data?.messages) {
          setMessages(data.data.messages);
        } else {
          setMessages([]); // Clear messages if no history found
        }
      } catch (error) {
        console.error("[DEBUG] Error loading chat history:", error);
        setMessages([]); // Clear messages on error
      }
    };

    loadChatHistory();
  }, [chatRoomId, session?.user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !session?.user) return;

    const newMessage: Message = {
      id: Date.now(),
      chat_room_id: chatRoomId || 0, // Temporary ID
      sender: "user" as const, // 明示的に "user" | "assistant" 型を指定
      body: inputMessage.trim(),
      created_at: new Date().toISOString(),
    };

    console.log("[DEBUG] Sending new message:", {
      message: inputMessage.trim(),
      chatRoomId,
      messageCount: messages.length,
    });

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage("");
    setIsLoading(true);
    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
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
        // Replace temporary user message and add assistant response
        setMessages((prev) => {
          const updatedMessages: Message[] = [
            ...prev.slice(0, -1), // Remove temporary user message
            {
              ...newMessage,
              chat_room_id: data.data.chatRoomId, // Update with actual chatRoomId
            },
            {
              id: Date.now() + 1,
              chat_room_id: data.data.chatRoomId,
              sender: "assistant" as const, // 明示的に "user" | "assistant" 型を指定
              body: data.data.message,
              created_at: new Date().toISOString(),
            },
          ];
          return updatedMessages;
        });

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
      setMessages((prev) => prev.slice(0, -1)); // Remove temporary message on error
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes wave {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-2px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .wave-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .wave-dot:nth-child(2) {
          animation-delay: 0.1s;
        }
        .wave-dot:nth-child(3) {
          animation-delay: 0.2s;
        }
        .wave-dot:nth-child(4) {
          animation-delay: 0.3s;
        }
      `}</style>
      <div
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          isFullScreen
            ? "fixed inset-0 z-50 rounded-none flex flex-col"
            : "relative"
        }`}
      >
        {/* Chat Header */}
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

        {/* Message Display Area */}
        <div
          className={`overflow-y-auto px-4 sm:px-6 py-6 bg-gray-50 dark:bg-gray-900 ${
            isFullScreen ? "flex-1" : "h-[500px]"
          }`}
        >
          {messages.length === 0 && !isThinking ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <ChatBubbleLeftIcon className="h-8 w-8" />
              <p>メッセージはまだありません</p>
              <p className="text-sm">
                下のフォームからメッセージを送信してください
              </p>
            </div>
          ) : (
            <div
              className={`space-y-12 ${
                isFullScreen ? "max-w-7xl mx-auto w-full px-4" : ""
              }`}
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
                          {/* Icon */}
                          <div className="flex-shrink-0">
                            {message.sender === "user" ? (
                              <div
                                className={`relative ${
                                  isFullScreen ? "w-16 h-16" : "w-16 h-16"
                                }`}
                              >
                                <div className="absolute inset-0 bg-sky-600 rounded-full shadow-lg"></div>
                                <div className="absolute inset-[2px] bg-white rounded-full flex items-center justify-center">
                                  <svg
                                    className={`${
                                      isFullScreen ? "w-12 h-12" : "w-10 h-10"
                                    } text-sky-600`}
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <div
                                className={`relative ${
                                  isFullScreen ? "w-16 h-16" : "w-16 h-16"
                                } bg-gradient-to-br from-sky-100 to-white rounded-full shadow-lg`}
                              >
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <img
                                    src="/assistant.png"
                                    alt="Assistant"
                                    className={`${
                                      isFullScreen ? "w-16 h-16" : "w-16 h-16"
                                    } rounded-full object-cover pt-5`}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Message and Time Container */}
                          <div className="flex-1 min-w-0">
                            {/* Message */}
                            <div
                              className={`inline-block rounded-2xl px-6 py-4 shadow-sm max-w-[80%] ${
                                message.sender === "user"
                                  ? "bg-sky-600 text-white rounded-tr-none float-right"
                                  : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none text-gray-900 dark:text-gray-100"
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
                            {/* Time */}
                            <div
                              className={`mt-1 clear-both ${
                                message.sender === "user"
                                  ? "text-right"
                                  : "text-left"
                              }`}
                            >
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  message.created_at
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
              {/* Thinking Indicator */}
              {isThinking && (
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0">
                    <div
                      className={`relative ${
                        isFullScreen ? "w-16 h-16" : "w-16 h-16"
                      } bg-gradient-to-br from-sky-100 to-white rounded-full shadow-lg`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src="/assistant.png"
                          alt="Assistant"
                          className={`${
                            isFullScreen ? "w-16 h-16" : "w-16 h-16"
                          } rounded-full object-cover pt-5`}
                        />
                      </div>
                      <div className="absolute inset-0 bg-sky-100/50 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <div className="rounded-2xl px-6 py-4 shadow-sm bg-white border border-gray-100 rounded-tl-none max-w-[700px] min-w-[200px] relative">
                    <div className="flex items-center justify-center space-x-1">
                      <div className="wave-dot w-2 h-2 bg-sky-500/80 rounded-full animate-[wave_1s_ease-in-out_infinite]"></div>
                      <div className="wave-dot w-2 h-2 bg-sky-500/80 rounded-full animate-[wave_1s_ease-in-out_infinite]"></div>
                      <div className="wave-dot w-2 h-2 bg-sky-500/80 rounded-full animate-[wave_1s_ease-in-out_infinite]"></div>
                      <div className="wave-dot w-2 h-2 bg-sky-500/80 rounded-full animate-[wave_1s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Form */}
        <div
          className={`border-t border-gray-100 bg-white ${
            isFullScreen ? "px-6 py-6 shadow-lg" : "p-4"
          }`}
        >
          <form
            onSubmit={handleSubmit}
            className={`flex space-x-4 ${isFullScreen ? "max-w-5xl mx-auto" : ""}`}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="メッセージを入力..."
              className={`flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-4 ${
                isFullScreen ? "py-3.5 text-base" : "py-2 text-[15px]"
              } focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm`}
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
    </>
  );
}
