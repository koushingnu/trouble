"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastNameKana, setLastNameKana] = useState("");
  const [firstNameKana, setFirstNameKana] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalSteps = 3;

  // ステップ1のバリデーション（非同期でトークンチェック）
  const validateStep1 = async () => {
    if (!email || !password || !confirmPassword || !token) {
      setError("すべての項目を入力してください");
      return false;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return false;
    }

    if (password.length < 5) {
      setError("パスワードは5文字以上で設定してください");
      return false;
    }

    // トークンの検証
    try {
      const res = await fetch("/api/tokens/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setError("認証キーが違います。正しい認証キーを入力してください。");
        return false;
      }

      return true;
    } catch (error) {
      setError("認証キーの検証中にエラーが発生しました");
      return false;
    }
  };

  // ステップ2のバリデーション（非同期でメールアドレスチェック）
  const validateStep2 = async () => {
    if (!lastName || !firstName || !lastNameKana || !firstNameKana) {
      setError("すべての項目を入力してください");
      return false;
    }

    // フリガナの形式チェック（カタカナのみ）
    const kanaRegex = /^[ァ-ヶー]+$/;
    if (!kanaRegex.test(lastNameKana) || !kanaRegex.test(firstNameKana)) {
      setError("フリガナはカタカナで入力してください");
      return false;
    }

    // メールアドレスの重複チェック
    try {
      const emailCheckRes = await fetch("/api/users/check-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const emailData = await emailCheckRes.json();

      if (emailData.exists) {
        setError("このメールアドレスは既に登録されています");
        return false;
      }

      return true;
    } catch (error) {
      setError("メールアドレスの確認中にエラーが発生しました");
      return false;
    }
  };

  // ステップ3のバリデーション
  const validateStep3 = () => {
    if (!phoneNumber || !postalCode || !address) {
      setError("すべての項目を入力してください");
      return false;
    }

    // 電話番号の形式チェック（ハイフンなし、10桁または11桁）
    const phoneRegex = /^(0[5-9]0\d{8}|0[1-9]\d{8})$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("電話番号は10桁または11桁の数字で入力してください（例: 08012345678）");
      return false;
    }

    // 郵便番号の形式チェック（ハイフンなし、7桁）
    const postalCodeRegex = /^\d{7}$/;
    if (!postalCodeRegex.test(postalCode)) {
      setError("郵便番号は7桁の数字で入力してください（例: 1234567）");
      return false;
    }

    // 利用規約への同意チェック
    if (!agreedToTerms) {
      setError("プライバシーポリシーと利用規約に同意してください");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    setError("");
    setLoading(true);

    try {
      if (currentStep === 1) {
        const isValid = await validateStep1();
        if (!isValid) {
          setLoading(false);
          return;
        }
      }

      if (currentStep === 2) {
        const isValid = await validateStep2();
        if (!isValid) {
          setLoading(false);
          return;
        }
      }

      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep3()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

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
          lastNameKana,
          firstNameKana,
          phoneNumber,
          postalCode,
          address,
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
      setLastNameKana("");
      setFirstNameKana("");
      setPhoneNumber("");
      setPostalCode("");
      setAddress("");

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
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              新規登録
            </h1>

            {/* ステップインジケーター */}
            <div className="flex items-center justify-center mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      step === currentStep
                        ? "bg-[#1888CF] text-white"
                        : step < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step < currentStep ? "✓" : step}
                  </div>
                  {step < totalSteps && (
                    <div
                      className={`w-12 h-1 mx-2 transition-colors ${
                        step < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* ステップタイトル */}
            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-700">
                {currentStep === 1 && "ステップ1: アカウント情報"}
                {currentStep === 2 && "ステップ2: 個人情報"}
                {currentStep === 3 && "ステップ3: 連絡先情報"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep} / {totalSteps}
              </p>
            </div>

            {/* 認証キーに関する注意ボックス（ステップ1のみ） */}
            {currentStep === 1 && (
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
            )}

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
              {/* ステップ1: アカウント情報 */}
              {currentStep === 1 && (
                <>
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
                        placeholder="パスワード（5文字以上）"
                        required
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
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ステップ2: 個人情報 */}
              {currentStep === 2 && (
                <>
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
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Image
                        src="/icon/user.svg"
                        alt="姓（フリガナ）"
                        width={20}
                        height={20}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      />
                      <input
                        type="text"
                        value={lastNameKana}
                        onChange={(e) => setLastNameKana(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                        placeholder="姓フリガナ（例: ヤマダ）"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Image
                        src="/icon/user.svg"
                        alt="名（フリガナ）"
                        width={20}
                        height={20}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      />
                      <input
                        type="text"
                        value={firstNameKana}
                        onChange={(e) => setFirstNameKana(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                        placeholder="名フリガナ（例: タロウ）"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ステップ3: 連絡先情報 */}
              {currentStep === 3 && (
                <>
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
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Image
                        src="/icon/mail.svg"
                        alt="郵便番号"
                        width={20}
                        height={20}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      />
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                        placeholder="郵便番号（例: 1234567）"
                        required
                        maxLength={7}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Image
                        src="/icon/mail.svg"
                        alt="住所"
                        width={20}
                        height={20}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-[#1888CF] bg-[#FDFDFD] text-gray-800 placeholder-gray-400"
                        placeholder="住所（例: 東京都渋谷区道玄坂1-2-3）"
                        required
                      />
                    </div>
                  </div>

                  {/* 利用規約同意チェックボックス */}
                  <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <p className="text-sm text-gray-800 leading-relaxed mb-3">
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1888CF] hover:text-[#1565A0] font-medium underline"
                      >
                        プライバシーポリシー
                      </Link>
                      、
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1888CF] hover:text-[#1565A0] font-medium underline"
                      >
                        利用規約
                      </Link>
                      をご確認・ご同意の上登録ボタンを押してください。
                    </p>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-5 h-5 text-[#1888CF] border-gray-300 rounded focus:ring-[#1888CF] cursor-pointer"
                      />
                      <span className="ml-3 text-sm text-gray-800 font-medium">
                        同意する
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* ボタンエリア */}
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-full font-bold hover:bg-gray-400 transition-colors duration-200"
                  >
                    戻る
                  </button>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={loading}
                    className={`${
                      currentStep === 1 ? "w-full" : "flex-1"
                    } bg-[#1888CF] text-white py-3 px-6 rounded-full font-bold hover:bg-[#1568a8] disabled:opacity-50 transition-colors duration-200`}
                  >
                    {loading && (currentStep === 1 || currentStep === 2) ? "確認中..." : "次へ"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !agreedToTerms}
                    className="flex-1 bg-[#1888CF] text-white py-3 px-6 rounded-full font-bold hover:bg-[#1568a8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? "登録中..." : "登録する"}
                  </button>
                )}
              </div>
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

      <Footer />
    </div>
  );
}
