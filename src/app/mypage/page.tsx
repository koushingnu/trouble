"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface UserDetails {
  email: string;
  is_admin: boolean;
  created_at: string;
  chat_rooms_count: number;
  resolved_count: number;
  in_progress_count: number;
  escalated_count: number;
}

export default function MyPage() {
  const { data: session } = useSession();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/users/me");
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }

        const data = await response.json();
        if (data.success) {
          setUserDetails(data.data);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [session?.user]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="page-title">マイページ</h1>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <p className="text-center text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="page-title">マイページ</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ユーザー情報 */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            ユーザー情報
          </h2>
          <div className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                メールアドレス
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userDetails?.email || session?.user?.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                アカウントタイプ
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    userDetails?.is_admin || session?.user?.is_admin
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {userDetails?.is_admin || session?.user?.is_admin
                    ? "管理者"
                    : "一般ユーザー"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">登録日</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {userDetails?.created_at
                  ? new Date(userDetails.created_at).toLocaleDateString(
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
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            相談履歴サマリー
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-sky-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-sky-900">総相談件数</dt>
              <dd className="mt-1 text-2xl font-semibold text-sky-700">
                {userDetails?.chat_rooms_count || 0}
              </dd>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-green-900">解決済み</dt>
              <dd className="mt-1 text-2xl font-semibold text-green-700">
                {userDetails?.resolved_count || 0}
              </dd>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-yellow-900">対応中</dt>
              <dd className="mt-1 text-2xl font-semibold text-yellow-700">
                {userDetails?.in_progress_count || 0}
              </dd>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <dt className="text-sm font-medium text-blue-900">電話対応</dt>
              <dd className="mt-1 text-2xl font-semibold text-blue-700">
                {userDetails?.escalated_count || 0}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
