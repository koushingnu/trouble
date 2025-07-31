import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 認証が不要なパス
const PUBLIC_PATHS = ["/auth", "/auth/error", "/register"];

export default withAuth(
  function middleware(req) {
    // 認証済みユーザーが認証ページにアクセスした場合はホームにリダイレクト
    if (req.nextauth.token && PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const path = req.nextUrl.pathname;

        // APIルートはスキップ（auth関連のエンドポイントは除く）
        if (path.startsWith("/api/") && !path.startsWith("/api/auth")) {
          return true;
        }

        // 静的ファイルはスキップ
        if (
          path.startsWith("/_next/") ||
          path.startsWith("/static/") ||
          path === "/favicon.ico"
        ) {
          return true;
        }

        // 公開パスは常に許可
        if (PUBLIC_PATHS.some((publicPath) => path.startsWith(publicPath))) {
          return true;
        }

        // それ以外はトークンの有無で判断
        return !!token;
      },
    },
  }
);

// 保護するパスを指定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
