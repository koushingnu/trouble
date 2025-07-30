import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  // Amplifyデプロイ用の設定
  typescript: {
    ignoreBuildErrors: true // プロダクションビルド時のTS厳密チェックを無効化
  },
  eslint: {
    ignoreDuringBuilds: true // プロダクションビルド時のESLintチェックを無効化
  }
};

export default nextConfig;
