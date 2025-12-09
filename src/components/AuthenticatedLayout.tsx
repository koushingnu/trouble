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
      <header className="w-full bg-[#FDFDFD] py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Image
            src="/logo/logo.svg"
            alt="トラブルまるごとレスキュー隊"
            width={450}
            height={98}
            priority
            className="mx-auto w-full max-w-[280px] h-auto"
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
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-6 text-sm text-gray-600">
          <p>運営者情報</p>
          <p>プライバシーポリシー</p>
          <p>お問い合わせ</p>
        </div>
      </footer>
    </div>
  );
}

