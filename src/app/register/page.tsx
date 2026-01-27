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
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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

    if (password.length < 5) {
      setError("パスワードは5文字以上で設定してください");
      setLoading(false);
      return;
    }

    if (!lastName || !firstName || !phoneNumber) {
      setError("すべての項目を入力してください");
      setLoading(false);
      return;
    }

    // 電話番号の形式チェック（ハイフンなし、10桁または11桁）
    const phoneRegex = /^(0[5-9]0\d{8}|0[1-9]\d{8})$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("電話番号は10桁または11桁の数字で入力してください（例: 08012345678）");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          token,
          lastName,
          firstName,
          phoneNumber,
        }),
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
      setLastName("");
      setFirstName("");
      setPhoneNumber("");

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

            {/* 認証キーに関する注意ボックス */}
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="text-sm text-gray-800 leading-relaxed">
                新規会員登録には、認証キーの入力が必要です。認証キーは、「月額PAY」での決済登録完了後に発行されます。まだ決済登録がお済みでない方は下記より「月額PAY」の決済登録を行ってください。
              </p>
              <a
                href="https://neoglyph.co.jp/apply/?shop_id=ODMz"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sm text-[#1888CF] hover:text-[#1565A0] font-medium underline"
              >
                「月額PAY」での決済登録はこちら 
              </a>
            </div>

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
                    src="/icon/user.svg"
                    alt="姓"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="姓（例: 山田）"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Image
                    src="/icon/user.svg"
                    alt="名"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="名（例: 太郎）"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Image
                    src="/icon/phone.svg"
                    alt="電話番号"
                    width={20}
                    height={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                    placeholder="電話番号（例: 09012345678）"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Image
                    src="/icon/password.svg"
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
                    placeholder="パスワード（確認）"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
