"use client";

import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start pt-12 px-4 sm:px-6 lg:px-8 bg-sky-50">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-sky-900 mb-8">
          会員認証
        </h1>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-sky-100">
          <p className="text-base text-gray-600 mb-6">
            「会員ID」と「パスワード」を入力してください
          </p>

          <form className="space-y-6">
            <div>
              <label
                htmlFor="memberId"
                className="block text-gray-700 text-base font-medium mb-2"
              >
                会員ID
              </label>
              <input
                id="memberId"
                name="memberId"
                type="text"
                required
                placeholder="例: nnn12345"
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-base"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/auth/forgot-id"
                  className="text-sm text-sky-600 hover:text-sky-500"
                >
                  会員IDをお忘れの方
                </Link>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 text-base font-medium mb-2"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-base"
              />
              <div className="mt-2 text-right">
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-sky-600 hover:text-sky-500"
                >
                  パスワードを忘れた方
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-400 transition-colors"
            >
              ログイン
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500">または</div>
            <Link
              href="/register"
              className="mt-3 w-full inline-flex justify-center py-3 px-4 border border-sky-600 rounded-md shadow-sm text-base font-medium text-sky-600 bg-white hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
            >
              新規会員登録
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
