"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import TroubleChat from "../../../components/TroubleChat";

export default function ConsultationDetailPage() {
  const params = useParams();
  const chatRoomId = params.id;

  // チャットルームIDをローカルストレージに保存
  useEffect(() => {
    if (chatRoomId) {
      localStorage.setItem("currentChatRoomId", chatRoomId.toString());
    }
  }, [chatRoomId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="page-title">相談詳細</h1>
        <p className="mt-4 text-sm text-gray-600">
          過去の相談内容を確認できます。
        </p>
      </div>

      <TroubleChat initialChatRoomId={parseInt(chatRoomId as string, 10)} />
    </div>
  );
}
