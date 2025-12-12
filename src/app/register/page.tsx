"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "登録中にエラーが発生しました");
      }

      setSuccess(true);
      // フォームをクリア
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setToken("");

      // 3秒後にログインページへリダイレクト
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "登録中にエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
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
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              新規登録
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                登録が完了しました。3秒後にログインページへ移動します...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Image
                    src="/icon/mail.svg"
                    alt="メール"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#1888CF]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="メールアドレス"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Image
                    src="/icon/lock.svg"
                    alt="パスワード"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="パスワード"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Image
                    src="/icon/lock.svg"
                    alt="パスワード確認"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="パスワード（確認）"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Image
                    src="/icon/lock.svg"
                    alt="認証キー"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="認証キー"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1888CF] text-white py-3 px-6 rounded-full font-bold hover:bg-[#1568a8] disabled:opacity-50 transition-colors duration-200 mt-6"
              >
                {loading ? "登録中..." : "登録する"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth"
                className="text-[#1888CF] hover:underline text-sm font-medium"
              >
                すでにアカウントをお持ちの方はこちら
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full bg-[#FDFDFD] py-3 text-center">
        <p className="text-xs text-gray-600">© 2025 トラブルまるごとレスキュー隊</p>
      </footer>
    </div>
  );
}
