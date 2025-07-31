/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // 環境変数の設定
  env: {
    NEXTAUTH_URL: "https://main.d1rof7j3ceo01r.amplifyapp.com",
    NEXTAUTH_URL_INTERNAL: "https://main.d1rof7j3ceo01r.amplifyapp.com",
    NEXT_PUBLIC_BASE_URL: "https://main.d1rof7j3ceo01r.amplifyapp.com",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
