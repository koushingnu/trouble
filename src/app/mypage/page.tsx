"use client";

import { useSession } from "next-auth/react";

export default function MyPage() {
  const { data: session } = useSession();
  console.log("Session data:", session); // デバッグ用

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="page-title">マイページ</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ユーザー情報 */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            ユーザー情報
          </h2>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                メールアドレス
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {session?.user?.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                アカウントタイプ
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {session?.user?.isAdmin ? "管理者" : "一般ユーザー"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">登録日</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {session?.user?.created_at
                  ? new Date(session.user.created_at).toLocaleDateString(
                      "ja-JP",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "-"}
              </dd>
            </div>
          </div>
        </div>

        {/* 相談履歴サマリー */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            相談履歴サマリー
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-sky-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-sky-900">総相談件数</dt>
              <dd className="mt-1 text-2xl font-semibold text-sky-700">-</dd>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-green-900">解決済み</dt>
              <dd className="mt-1 text-2xl font-semibold text-green-700">-</dd>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-yellow-900">対応中</dt>
              <dd className="mt-1 text-2xl font-semibold text-yellow-700">-</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
