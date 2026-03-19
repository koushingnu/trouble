"use client";

import Image from "next/image";
import MenuHeader from "./MenuHeader";
import Footer from "./Footer";

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
            className="mx-auto w-full max-w-[145px] md:max-w-[200px] h-auto"
          />
        </div>
      </header>

      {/* メニューヘッダー */}
      <MenuHeader />

      {/* メインコンテンツ */}
      <main className="flex-1 w-full">
        {children}
      </main>

      <div className="mt-auto">
        <Footer maxWidth="7xl" />
      </div>
    </div>
  );
}

