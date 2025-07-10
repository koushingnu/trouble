import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/ClientNavigation";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "トラブル相談",
  description: "トラブル相談サービス",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          <ClientNavigation />
        {children}
        </Providers>
      </body>
    </html>
  );
}
