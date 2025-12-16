"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが正しくありません");
        setLoading(false);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("ログイン中にエラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="w-full bg-[#FDFDFD] py-4 px-4">
        <div className="max-w-md mx-auto text-center px-6">
          <Image
            src="/logo/logo.svg"
            alt="トラブルまるごとレスキュー隊"
            width={450}
            height={98}
            priority
            className="mx-auto w-full max-w-[200px] h-auto"
          />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 w-full bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4] px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
              ログイン
            </h1>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* メールアドレス */}
              <div>
                <div className="flex items-center mb-2">
                  <Image
                    src="/icon/mail.svg"
                    alt="メール"
                    width={40}
                    height={40}
                    className="w-6 h-6 mr-2"
                  />
                  <label className="text-gray-700 font-medium">
                    メールアドレス
                  </label>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800"
                  required
                />
              </div>

              {/* パスワード */}
              <div>
                <div className="flex items-center mb-2">
                  <Image
                    src="/icon/password.svg"
                    alt="パスワード"
                    width={40}
                    height={40}
                    className="w-6 h-6 mr-2"
                  />
                  <label className="text-gray-700 font-medium">
                    パスワード
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800"
                  required
                />
              </div>

              {/* ログインボタン */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1888CF] text-white py-4 px-4 rounded-full font-bold text-lg hover:bg-[#1568a8] disabled:opacity-50 transition-colors duration-200 shadow-md"
              >
                {loading ? "ログイン中..." : "ログイン"}
              </button>
            </form>

            {/* パスワード忘れた方 */}
            <div className="mt-4 text-center">
              <Link
                href="/reset-password"
                className="text-sm text-gray-600 hover:text-[#1888CF] underline"
              >
                パスワードをお忘れの方はこちら
              </Link>
            </div>

            {/* 新規登録リンク */}
            <div className="mt-6 pt-6 border-t border-gray-300">
              <p className="text-center text-gray-700 font-medium mb-4">
                アカウントをお持ちでない方
              </p>
              <Link
                href="/register"
                className="block w-full text-center bg-[#FDFDFD] text-[#1888CF] py-3 px-4 rounded-full font-bold border-2 border-[#1888CF] hover:bg-[#f0f8ff] transition-colors duration-200"
              >
                新規登録はこちら
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full bg-[#FDFDFD] py-4 px-4 border-t border-gray-200">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm text-gray-600">
          <Link href="/company" className="hover:text-[#1888CF]">
            運営者情報
          </Link>
          <Link href="/privacy" className="hover:text-[#1888CF]">
            プライバシーポリシー
          </Link>
          <a
            href="https://jp01-troublesoudan.site-test02.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1888CF]"
          >
            お問い合わせ
          </a>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          © 2025 トラブルまるごとレスキュー隊
        </p>
      </footer>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}

