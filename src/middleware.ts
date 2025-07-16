import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 未ログインユーザーは/authと/registerのみアクセス可能
    if (!token) {
      if (path !== "/auth" && path !== "/register") {
        return NextResponse.redirect(new URL("/auth", req.url));
      }
      return NextResponse.next();
    }

    // ログイン済みユーザーは/authと/register以外にアクセス可能
    if (token && (path === "/auth" || path === "/register")) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // 認証チェックは上のミドルウェア関数で行う
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
     * - auth (認証ページ)
     * - register (登録ページ)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth|register).*)",
    "/consultation/:path*",
    "/history/:path*",
    "/contact/:path*",
    "/admin/:path*",
  ],
};
