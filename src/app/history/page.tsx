"use client";

import Link from "next/link";

export default function HistoryPage() {
  const consultations = [
    {
      id: "1",
      title: "深夜の騒音トラブルについて",
      date: "2024年3月15日",
      status: "対応中",
      preview:
        "深夜の騒音問題についてご相談を承りました。状況を詳しく確認させていただきたいのですが...",
      messages: 5,
    },
    {
      id: "2",
      title: "不審者の出没について",
      date: "2024年3月10日",
      status: "解決済み",
      preview:
        "マンション周辺での不審者の出没について、防犯カメラの設置や警察への巡回依頼など、具体的な対策をご提案させていただきます。",
      messages: 7,
    },
    {
      id: "3",
      title: "ゴミ出しルール違反の対応",
      date: "2024年3月5日",
      status: "解決済み",
      preview:
        "近隣住民のゴミ出しルール違反について、管理組合を通じた対応方法をご案内させていただきます。",
      messages: 4,
    },
    {
      id: "4",
      title: "迷惑駐車への対処方法",
      date: "2024年3月1日",
      status: "解決済み",
      preview:
        "マンション敷地内での迷惑駐車について、管理規約に基づいた具体的な対処方法をご案内いたします。",
      messages: 6,
    },
    {
      id: "5",
      title: "ストーカー被害の相談",
      date: "2024年2月28日",
      status: "対応中",
      preview:
        "ストーカー被害についてご相談を承りました。警察への通報方法や証拠の収集方法など、安全を最優先とした対応をご案内いたします。",
      messages: 8,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="page-title">相談履歴</h1>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <div className="divide-y divide-gray-200">
          {consultations.map((consultation) => (
            <div
              key={consultation.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-medium text-gray-900 truncate">
                      {consultation.title}
                    </h2>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consultation.status === "解決済み"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {consultation.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {consultation.preview}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{consultation.date}</span>
                    <span>・</span>
                    <span>{consultation.messages}件のメッセージ</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Link
                    href={`/consultation/${consultation.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-sky-600 text-xs font-medium rounded-md text-sky-600 bg-white hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
