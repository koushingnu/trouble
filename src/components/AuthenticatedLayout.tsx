"use client";

import MenuHeader from "./MenuHeader";
import Footer from "./Footer";
import LogoHeader from "./LogoHeader";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (    
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
    {/* メインヘッダー */}
    <LogoHeader />


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

