"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // バリデーション
    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません");
      setLoading(false);
      return;
    }

    if (newPassword.length < 5) {
      setError("パスワードは5文字以上で設定してください");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "パスワードのリセットに失敗しました");
      }

      setSuccess(true);
      // フォームをクリア
      setEmail("");
      setToken("");
      setNewPassword("");
      setConfirmPassword("");

      // 3秒後にログインページへリダイレクト
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "パスワードのリセットに失敗しました"
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
          <Link href="/auth">
            <Image
              src="/logo/logo.svg"
              alt="トラブルまるごとレスキュー隊"
              width={450}
              height={98}
              priority
              className="mx-auto w-full max-w-[200px] h-auto cursor-pointer"
            />
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              パスワード再設定
            </h1>

            <p className="text-sm text-gray-600 text-center mb-6">
              登録時のメールアドレスと認証キーを入力して、新しいパスワードを設定してください。
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                パスワードを再設定しました。3秒後にログインページへ移動します...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* メールアドレス */}
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

              {/* 認証キー */}
              <div>
                <div className="relative">
                  <Image
                    src="/icon/key.svg"
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

              {/* 新しいパスワード */}
              <div>
                <div className="relative">
                  <Image
                    src="/icon/password.svg"
                    alt="新しいパスワード"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="新しいパスワード"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 新しいパスワード（確認） */}
              <div>
                <div className="relative">
                  <Image
                    src="/icon/password.svg"
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
                    placeholder="新しいパスワード（確認）"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* リセットボタン */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1888CF] text-white py-4 px-4 rounded-full font-bold text-lg hover:bg-[#1568a8] disabled:opacity-50 transition-colors duration-200 shadow-md mt-6"
              >
                {loading ? "処理中..." : "パスワードを再設定"}
              </button>
            </form>

            {/* ログイン画面へ戻る */}
            <div className="mt-6 text-center">
              <Link
                href="/auth"
                className="text-[#1888CF] hover:underline text-sm font-medium"
              >
                ← ログイン画面に戻る
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
            href="https://troublesolution-lab.com/"
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

