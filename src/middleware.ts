import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 認証が不要なパス
const PUBLIC_PATHS = ["/auth", "/auth/error", "/register"];

export default withAuth(
  function middleware(req) {
    // 認証済みユーザーが認証ページにアクセスした場合はホームにリダイレクト
    if (req.nextauth.token && req.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req }) {
        // 公開パスは常に許可
        if (
          PUBLIC_PATHS.some((path) => req.nextUrl.pathname.startsWith(path))
        ) {
          return true;
        }

        // APIルートは常に許可
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return true;
        }

        // それ以外のパスは認証が必要
        return !!req.nextauth.token;
      },
    },
  }
);

// 保護するパスを指定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico).*)",
  ],
};
