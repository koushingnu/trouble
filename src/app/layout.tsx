import type { Metadata } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-zen-kaku-gothic-new",
});

export const metadata: Metadata = {
  title: "トラブルまるごとレスキュー隊",
  description: "生活トラブル相談サービス",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={zenKakuGothicNew.variable}>
      <body className={zenKakuGothicNew.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
