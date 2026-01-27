import Link from "next/link";
import Image from "next/image";

export default function Company() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
      {/* ヘッダー */}
      <header className="w-full bg-[#FDFDFD] py-4 px-4">
        <div className="max-w-4xl mx-auto text-center">
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
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              運営者情報
            </h1>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">
                  運営会社
                </dt>
                <dd className="text-lg text-gray-800">株式会社メディアサービス</dd>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">
                  代表者
                </dt>
                <dd className="text-lg text-gray-800">持山　宗治</dd>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">住所</dt>
                <dd className="text-lg text-gray-800">
                  〒170-0013　東京都豊島区東池袋1-25-8　タカセビル3F
                </dd>
              </div>

              <div className="pb-4">
                <dt className="text-sm font-medium text-gray-500 mb-2">
                  電話番号
                </dt>
                <dd className="text-lg text-gray-800">0120-542-179</dd>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/auth"
                className="text-[#1888CF] hover:underline font-medium"
              >
                ← トップページに戻る
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full bg-[#FDFDFD] py-4 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm text-gray-600">
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
