import type { Metadata } from "next";
import { Murecho } from "next/font/google";
import "./globals.css";
import ClientNavigation from "@/components/ClientNavigation";
import { Providers } from "./providers";

const murecho = Murecho({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-murecho",
});

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
    <html lang="ja" className={murecho.variable}>
      <body className={murecho.className}>
        <Providers>
          <ClientNavigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
