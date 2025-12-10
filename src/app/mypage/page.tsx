"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

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

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth" });
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-6 text-center text-gray-500">
            読み込み中...
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-[#FDFDFD] rounded-3xl shadow-lg overflow-hidden">
          {/* ヘッダー */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">マイページ</h1>
          </div>

          {/* コンテンツエリア */}
          <div className="px-6 py-8 space-y-8">
            {/* ユーザー情報セクションは空白 */}
            <div className="min-h-[300px]">
              {/* 将来的にユーザー情報を追加する場合のスペース */}
            </div>

            {/* ログアウトボタン */}
            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full bg-[#FDFDFD] text-[#1888CF] py-4 px-6 rounded-full font-bold text-lg border-2 border-[#1888CF] hover:bg-[#f0f8ff] transition-colors duration-200 shadow-sm"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
