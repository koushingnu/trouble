"use client";

import Image from "next/image";
import MenuHeader from "./MenuHeader";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
      {/* メインヘッダー */}
      <header className="w-full bg-[#FDFDFD] py-3 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
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

      {/* メニューヘッダー */}
      <MenuHeader />

      {/* メインコンテンツ */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* フッター */}
      <footer className="w-full bg-[#FDFDFD] py-4 px-4 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-sm text-gray-600">
          <a href="/company" className="hover:text-[#1888CF]">
            運営者情報
          </a>
          <a href="/privacy" className="hover:text-[#1888CF]">
            プライバシーポリシー
          </a>
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

