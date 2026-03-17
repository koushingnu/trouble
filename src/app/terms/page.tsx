import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#ACE0F9] to-[#64B3F4]">
      {/* ヘッダー */}
      <header className="w-full bg-[#FDFDFD] py-4 px-4">
        <div className="max-w-md mx-auto text-center px-6">
          <Image
            src="/logo/logo.svg"
            alt="トラブルまるごとレスキュー隊"
            width={450}
            height={98}
            priority
            className="mx-auto w-full max-w-[200px] h-auto"
          />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#FDFDFD] rounded-3xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              利用規約
            </h1>

            <div className="prose prose-sm max-w-none text-gray-700">
              <p className="text-center text-gray-500 py-8">
                利用規約の内容は準備中です。
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/"
                className="inline-block bg-[#1888CF] text-white py-3 px-8 rounded-full font-bold hover:bg-[#1568a8] transition-colors duration-200"
              >
                トップページへ戻る
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer maxWidth="4xl" />
    </div>
  );
}
