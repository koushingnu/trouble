"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import NewTroubleChat from "../../../components/NewTroubleChat";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function ConsultationDetailPage() {
  const params = useParams();
  const chatRoomId = params.id;

  useEffect(() => {
    if (chatRoomId) {
      localStorage.setItem("currentChatRoomId", chatRoomId.toString());
    }
  }, [chatRoomId]);

  return (
    <AuthenticatedLayout>
      <div className="max-w-md mx-auto px-4 py-6">
        <NewTroubleChat initialChatRoomId={parseInt(chatRoomId as string, 10)} />
      </div>
    </AuthenticatedLayout>
  );
}
