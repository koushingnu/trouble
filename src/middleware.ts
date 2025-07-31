import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const PUBLIC_PATHS = ["/auth", "/auth/error", "/register"];

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
      pathname.startsWith("/api")
    ) {
      console.log("→ Skipping middleware (static/api)");
      return NextResponse.next();
    }

    // パブリックパスはスキップ
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      console.log("→ Public path, proceeding");
      return NextResponse.next();
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

        // 静的ファイル、APIルート、パブリックパスは常に許可
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/static") ||
          pathname.startsWith("/favicon.ico") ||
          pathname.startsWith("/api") ||
          PUBLIC_PATHS.some((path) => pathname.startsWith(path))
        ) {
          console.log("→ Authorized: public resource");
          return true;
        }

        const hasToken = !!token;
        console.log("→ Authorization result:", hasToken);
        return hasToken;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
