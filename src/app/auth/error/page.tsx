"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "認証エラーが発生しました";
  if (error === "CredentialsSignin") {
    errorMessage = "メールアドレスまたはパスワードが正しくありません";
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start pt-12 px-4 sm:px-6 lg:px-8 bg-sky-50">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-red-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            ログインエラー
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <Link
            href="/auth"
            className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
