import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const response = NextResponse.next();

    // ログイン済みユーザーが/authにアクセスした場合は、常にホームページにリダイレクト
    if (token && path === "/auth") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 未ログインユーザーは/authと/registerのみアクセス可能
    if (!token) {
      if (path !== "/auth" && path !== "/register") {
        return NextResponse.redirect(new URL("/auth", req.url));
      }
      return response;
    }

    return response;
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
