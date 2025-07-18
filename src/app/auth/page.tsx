"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaEnvelope, FaLock } from "react-icons/fa";
import FullScreenLoading from "@/components/FullScreenLoading";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ブラウザの戻るボタンでこのページに来た場合、ホームページに遷移
    if (window.performance && window.performance.navigation.type === 2) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("メールアドレスまたはパスワードが正しくありません");
        setLoading(false);
        return;
      }

      toast.success("ログインしました");
      setIsRedirecting(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push("/");
    } catch {
      toast.error("ログイン中にエラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <>
      {(loading || isRedirecting) && (
        <FullScreenLoading
          message={isRedirecting ? "ページ移動中..." : "ログイン中..."}
        />
      )}
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4 -mt-16">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 font-noto-sans-jp">
              ログイン
            </h1>
            <div className="mt-2 h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-300 mx-auto rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="メールアドレス"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white text-gray-800 placeholder-gray-400"
                  placeholder="パスワード"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">アカウントをお持ちでない方は</p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-500 py-2 px-6 rounded-lg font-semibold border-2 border-blue-500 hover:bg-blue-50 transition-colors duration-200"
            >
              新規登録
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
