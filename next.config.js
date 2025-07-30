/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // Amplifyデプロイ用の設定
  typescript: {
    ignoreBuildErrors: true, // プロダクションビルド時のTS厳密チェックを無効化
  },
  eslint: {
    ignoreDuringBuilds: true, // プロダクションビルド時のESLintチェックを無効化
  },
  // 本番環境の設定
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  },
};

module.exports = nextConfig;
