/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "noto-sans-jp": ["var(--font-noto-sans-jp)"],
      },
      colors: {
        primary: "#2563eb", // カスタムのプライマリカラー（青色）
      },
    },
  },
  plugins: [],
};
