import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 公開パスのリスト
    const publicPaths = ["/auth", "/register", "/auth/error"];

    // APIルートはスキップ
    if (path.startsWith("/api/")) {
      return NextResponse.next();
    }

    // 公開パスへのアクセス
    if (publicPaths.includes(path)) {
      // ログイン済みユーザーが認証ページにアクセスした場合
      if (token) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      // 未ログインユーザーの公開パスへのアクセスは許可
      return NextResponse.next();
    }

    // 保護されたパスへのアクセス
    if (!token) {
      // 未ログインユーザーは認証ページへリダイレクト
      const url = new URL("/auth", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // ログイン済みユーザーの通常アクセス
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
