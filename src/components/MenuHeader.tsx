"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function MenuHeader() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "相談する",
      path: "/consultation/new",
      icon: "/icon/new.svg",
    },
    {
      name: "相談履歴",
      path: "/history",
      icon: "/icon/history.svg",
    },
    {
      name: "マイページ",
      path: "/mypage",
      icon: "/icon/mypage.svg",
    },
  ];

  return (
    <div className="w-full bg-[#FDFDFD] border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center py-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const iconColor = isActive ? "#FF7BAC" : "#1888CF";
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex flex-col items-center gap-1 py-2 px-4 transition-all"
              >
                <div className="relative w-8 h-8">
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={32}
                    height={32}
                    className="w-full h-full"
                    style={{
                      filter: isActive
                        ? "brightness(0) saturate(100%) invert(58%) sepia(65%) saturate(4589%) hue-rotate(312deg) brightness(102%) contrast(102%)"
                        : "brightness(0) saturate(100%) invert(37%) sepia(93%) saturate(1123%) hue-rotate(176deg) brightness(99%) contrast(92%)",
                    }}
                  />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-[#FF7BAC]" : "text-[#1888CF]"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

