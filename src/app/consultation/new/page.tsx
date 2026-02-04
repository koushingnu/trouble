"use client";

import NewTroubleChat from "../../../components/NewTroubleChat";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function NewConsultationPage() {

  return (
    <AuthenticatedLayout>
      <div className="h-full">
        <NewTroubleChat />
      </div>
    </AuthenticatedLayout>
  );
}
