import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 公開パスのリスト
const PUBLIC_PATHS = ["/auth", "/register", "/auth/error"];
// APIパスのリスト
const API_PATHS = ["/api/auth", "/api/proxy"];
// 静的アセットのパス
const STATIC_PATHS = ["/_next", "/favicon.ico"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 静的アセットとAPIパスはスキップ
    if (
      STATIC_PATHS.some((p) => path.startsWith(p)) ||
      API_PATHS.some((p) => path.startsWith(p))
    ) {
      return NextResponse.next();
    }

    // 公開パスへのアクセス
    if (PUBLIC_PATHS.includes(path)) {
      // ログイン済みユーザーが認証ページにアクセスした場合はホームにリダイレクト
      if (token) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      // 未ログインユーザーの公開パスへのアクセスは許可
      return NextResponse.next();
    }

    // 保護されたパスへのアクセス
    if (!token) {
      // 未ログインユーザーは認証ページへリダイレクト
      const callbackUrl = encodeURIComponent(path);
      return NextResponse.redirect(
        new URL(`/auth?callbackUrl=${callbackUrl}`, req.url)
      );
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
