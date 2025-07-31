import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 認証が不要なパス
const PUBLIC_PATHS = ["/auth", "/auth/error", "/register"];
const STATIC_PATHS = ["/_next", "/static", "/favicon.ico"];
const AUTH_PATHS = ["/api/auth"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // 静的ファイルはスキップ
    if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 認証関連のパスはスキップ
    if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // 認証済みユーザーが認証ページにアクセスした場合はホームにリダイレクト
    if (
      req.nextauth.token &&
      PUBLIC_PATHS.some((path) => pathname.startsWith(path))
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;

        // 静的ファイルは常に許可
        if (STATIC_PATHS.some((path) => pathname.startsWith(path))) {
          return true;
        }

        // 認証関連のパスは常に許可
        if (AUTH_PATHS.some((path) => pathname.startsWith(path))) {
          return true;
        }

        // 公開パスは常に許可
        if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
          return true;
        }

        // それ以外はトークンの有無で判断
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all paths except static files and auth paths
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
