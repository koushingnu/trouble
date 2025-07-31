import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const PUBLIC_PATHS = ["/auth", "/auth/error", "/register"];

export default withAuth(
  function middleware(req) {
    // デバッグログを追加
    console.log("Middleware path:", req.nextUrl.pathname);
    console.log("Has token:", !!req.nextauth?.token);

    // 静的ファイルとAPIルートはスキップ
    if (
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/static") ||
      req.nextUrl.pathname.startsWith("/favicon.ico") ||
      req.nextUrl.pathname.startsWith("/api")
    ) {
      console.log("Skipping middleware for:", req.nextUrl.pathname);
      return NextResponse.next();
    }

    // 認証済みユーザーが/authにアクセスした場合はホームにリダイレクト
    if (req.nextauth?.token && req.nextUrl.pathname.startsWith("/auth")) {
      console.log("Authenticated user accessing /auth, redirecting to home");
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("Proceeding with request");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        console.log("Checking authorization for:", req.nextUrl.pathname);

        // 静的ファイルとAPIルートは常に許可
        if (
          req.nextUrl.pathname.startsWith("/_next") ||
          req.nextUrl.pathname.startsWith("/static") ||
          req.nextUrl.pathname.startsWith("/favicon.ico") ||
          req.nextUrl.pathname.startsWith("/api")
        ) {
          console.log("Authorized: static or API route");
          return true;
        }

        // パブリックパスは常に許可
        if (
          PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path))
        ) {
          console.log("Authorized: public path");
          return true;
        }

        // それ以外はトークンをチェック
        const hasToken = !!token;
        console.log("Token check result:", hasToken);
        return hasToken;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
