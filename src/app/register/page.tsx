"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaLock, FaKey } from "react-icons/fa";
import FullScreenLoading from "../../components/FullScreenLoading";
import { toast } from "react-hot-toast";

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
      toast.error("パスワードが一致しません");
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
      toast.success("登録が完了しました");
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
      toast.error(
        error instanceof Error ? error.message : "登録中にエラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullScreenLoading message="登録中..." />}
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 -mt-16">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 font-noto-sans-jp">
              新規登録
            </h1>
            <div className="mt-2 h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
            <p className="mt-2 text-sm text-gray-600">
              認証キーをお持ちの方のみ登録いただけます
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-100 text-red-600 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-3 p-2 bg-green-50 border border-green-100 text-green-600 rounded text-sm">
              登録が完了しました。3秒後にログインページへ移動します...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white text-gray-800 placeholder-gray-400 text-base"
                  placeholder="メールアドレス"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white text-gray-800 placeholder-gray-400 text-base"
                  placeholder="パスワード"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white text-gray-800 placeholder-gray-400 text-base"
                  placeholder="パスワード（確認）"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white text-gray-800 placeholder-gray-400 text-base"
                  placeholder="認証キー"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200 text-base mt-4"
            >
              {loading ? "登録中..." : "登録する"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2 text-sm">
              すでにアカウントをお持ちの方は
            </p>
            <Link
              href="/auth"
              className="inline-block bg-white text-blue-500 py-1.5 px-6 rounded-lg font-semibold border-2 border-blue-500 hover:bg-blue-50 transition-colors duration-200 text-sm"
            >
              ログイン
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
