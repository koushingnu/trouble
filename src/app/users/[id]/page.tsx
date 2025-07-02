"use client";

import { useEffect, useState } from "react";
import { User } from "../../types";
import { getUser } from "../../api/users";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = Number(params.id);
        if (isNaN(userId)) {
          toast.error("無効なユーザーIDです");
          router.push("/");
          return;
        }

        const userData = await getUser(userId);
        setUser(userData);
      } catch {
        toast.error("ユーザー情報の取得に失敗しました");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          戻る
        </button>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl text-blue-600 font-semibold">
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              ユーザー情報
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 text-gray-900">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">名前</dt>
                <dd className="mt-1 text-gray-900">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  メールアドレス
                </dt>
                <dd className="mt-1 text-gray-900">{user.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  );
}
