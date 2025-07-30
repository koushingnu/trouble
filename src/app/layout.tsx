import type { Metadata } from "next";
import { Murecho } from "next/font/google";
import "./globals.css";
import ClientNavigation from "../components/ClientNavigation";
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
    <html lang="ja" className={`${murecho.variable}`}>
      <body className="min-h-screen bg-slate-50">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <ClientNavigation />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-white border-t border-gray-100 py-8">
              <div className="container mx-auto px-4">
                <div className="text-center text-sm text-gray-500">
                  © {new Date().getFullYear()} トラブル相談サービス
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
