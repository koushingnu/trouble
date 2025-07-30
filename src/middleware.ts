import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 認証が不要なパス
const PUBLIC_PATHS = ["/auth", "/register", "/auth/error"];

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;

    // APIルートと静的ファイルはスキップ
    if (
      path.startsWith("/api/") ||
      path.startsWith("/_next/") ||
      path === "/favicon.ico"
    ) {
      return NextResponse.next();
    }

    // 認証済みユーザーが認証ページにアクセスした場合
    const token = req.nextauth?.token;
    if (token && PUBLIC_PATHS.includes(path)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const path = req.nextUrl.pathname;
        // 公開パスは常に許可
        if (PUBLIC_PATHS.includes(path)) {
          return true;
        }
        // APIルートは許可
        if (path.startsWith("/api/")) {
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
     * Match all paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
