"use client";
import Image from "next/image";

export default function LogoHeader() {

  return (
     <header className="w-full bg-[#FDFDFD] py-3 px-4 border-b border-gray-200">
            <div className="max-w-7xl mx-auto text-center">
              <Image
                src="/logo/logo.svg"
                alt="トラブルまるごとレスキュー隊"
                width={450}
                height={98}
                priority
                className="mx-auto w-full max-w-[130px] md:max-w-[200px] h-auto"
              />
            </div>
          </header>
  );
}
