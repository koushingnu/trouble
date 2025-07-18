"use client";

import TroubleChat from "@/components/TroubleChat";

export default function NewConsultationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="page-title">新規相談</h1>
        <p className="mt-4 text-sm text-gray-600">
          トラブルについて、お気軽にご相談ください。専門のスタッフが丁寧に対応させていただきます。
        </p>
      </div>

      <TroubleChat />
    </div>
  );
}
