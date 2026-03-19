import Link from "next/link";

interface FooterProps {
  maxWidth?: "md" | "4xl" | "7xl";
}

export default function Footer({ maxWidth = "md" }: FooterProps) {
  const maxWidthClass =
    maxWidth === "md"
      ? "max-w-md"
      : maxWidth === "4xl"
      ? "max-w-4xl"
      : "max-w-7xl";

  return (
    <footer className="w-full bg-[#FDFDFD] py-4 px-4 border-t border-gray-200">
      <div
        className={`${maxWidthClass} mx-auto
      grid grid-cols-2 gap-y-2 gap-x-4 text-center
      sm:flex sm:flex-wrap lg:flex-nowrap sm:justify-center sm:items-center sm:gap-4 md:gap-6
      text-sm text-gray-600 whitespace-nowrap`}
      >
        <Link href="/company" className="hover:text-[#1888CF]">
          運営者情報
        </Link>
        <a
          href="https://troublesolution-lab.com/terms.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#1888CF]"
        >
          利用規約
        </a>
        <a
          href="https://troublesolution-lab.com/ordercontract.html"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#1888CF]"
        >
          特定商取引法
        </a>
        <Link href="/privacy" className="hover:text-[#1888CF]">
          プライバシーポリシー
        </Link>
        <a
          href="https://troublesolution-lab.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#1888CF]"
        >
          お問い合わせ
        </a>
      </div>
      <p className="text-center text-xs text-gray-500 mt-3">
        © 2026 トラブル解決ラボ
      </p>
    </footer>
  );
}
