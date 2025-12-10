import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const PUBLIC_PATHS = ["/auth", "/auth/error", "/register"];
const ADMIN_PATHS = ["/admin"];
const PROTECTED_PATHS = ["/consultation", "/history", "/mypage"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    console.log("\n=== Middleware Execution Start ===");
    console.log("Current path:", pathname);
    console.log("Full URL:", req.url);
    console.log("Token exists:", !!req.nextauth?.token);
    console.log("Session:", req.nextauth);

    // 静的ファイルとAPIルートはスキップ
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/static") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/logo") ||
      pathname.startsWith("/icon") ||
      pathname.startsWith("/assistant.png")
    ) {
      console.log("→ Skipping middleware (static/api)");
      return NextResponse.next();
    }

    // パブリックパスはスキップ
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      console.log("→ Public path, proceeding");
      return NextResponse.next();
    }

    // 保護されたパスの認証チェック
    if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
      if (!req.nextauth?.token) {
        console.log("→ Protected path without token, redirecting to /auth");
        return NextResponse.redirect(new URL("/auth", req.url));
      }
      console.log("→ Protected path with token, proceeding");
    }

    // 管理者ページのチェック
    if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
      if (!req.nextauth?.token?.is_admin) {
        console.log("→ Non-admin user attempting to access admin page");
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // ルートパスの場合
    if (pathname === "/") {
      if (!req.nextauth?.token) {
        console.log("→ No token at root, redirecting to /auth");
        return NextResponse.redirect(new URL("/auth", req.url));
      }
      console.log("→ Token exists at root, proceeding");
      return NextResponse.next();
    }

    // 認証済みユーザーが/authにアクセスした場合はホームにリダイレクト
    if (req.nextauth?.token && pathname.startsWith("/auth")) {
      console.log("→ Authenticated user at /auth, redirecting to root");
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("→ Default case, proceeding");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        console.log("\n=== Authorization Check ===");
        console.log("Path:", pathname);
        console.log("Token exists:", !!token);
        console.log("Is admin:", token?.is_admin);

        // 静的ファイル、APIルート、パブリックパスは常に許可
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/static") ||
          pathname.startsWith("/favicon.ico") ||
          pathname.startsWith("/api") ||
          pathname.startsWith("/logo") ||
          pathname.startsWith("/icon") ||
          pathname.startsWith("/assistant.png") ||
          PUBLIC_PATHS.some((path) => pathname.startsWith(path))
        ) {
          console.log("→ Authorized: public resource");
          return true;
        }

        // 管理者ページの権限チェック
        if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
          const isAdmin = token?.is_admin === true;
          console.log("→ Admin page access:", isAdmin ? "allowed" : "denied");
          return isAdmin;
        }

        const hasToken = !!token;
        console.log("→ Authorization result:", hasToken);
        return hasToken;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|logo|icon|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
