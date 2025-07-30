/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  env: {
    NEXTAUTH_URL:
      process.env.NEXTAUTH_URL ||
      process.env.AWS_BRANCH_URL ||
      "http://localhost:3000",
    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.AWS_BRANCH_URL ||
      "http://localhost:3000",
  },
};

module.exports = nextConfig;
