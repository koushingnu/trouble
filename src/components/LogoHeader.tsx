"use client";
import Image from "next/image";
import Link from "next/link";

export default function LogoHeader() {

  return (
     <header className="w-full bg-[#FDFDFD] py-3 px-4 border-b border-gray-200">
            <div className="max-w-7xl mx-auto text-center">
             <Link href="/consultation/new" className="hover:text-[#1888CF]">
              <Image
                src="/logo/logo.svg"
                alt="トラブルまるごとレスキュー隊"
                width={450}
                height={98}
                priority
                className="mx-auto w-full max-w-[130px] md:max-w-[200px] h-auto"
              />
              </Link>
            </div>
          </header>
  );
}
