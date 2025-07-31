import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 基本的なユーザー情報の型
interface CustomUser {
  id: string;
  email: string;
  token: string | null;
  tokenId: number | null;
  status: string | null;
  isAdmin: boolean;
  created_at: string;
}

declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }
  interface User {
    id: string;
    email: string;
    token: string | null;
    tokenId: number | null;
    status: string | null;
    isAdmin: boolean;
    created_at: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    token: string | null;
    tokenId: number | null;
    status: string | null;
    isAdmin: boolean;
    created_at: string;
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const API_AUTH = process.env.API_AUTH;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE is not defined");
}

if (!API_AUTH) {
  throw new Error("API_AUTH is not defined");
}

if (!NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not defined");
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// NextAuth設定
const options: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードを入力してください");
        }

        try {
          const url = new URL(API_BASE);
          url.searchParams.append("action", "authenticate");

          const formData = new URLSearchParams();
          formData.append("email", credentials.email);
          formData.append("password", credentials.password);

          const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${API_AUTH}`,
            },
            body: formData.toString(),
          });

          const responseText = await response.text();
          console.log("API Response:", responseText);

          if (!response.ok) {
            throw new Error(
              `認証に失敗しました。メールアドレスまたはパスワードが正しくありません。`
            );
          }

          let data;
          try {
            data = JSON.parse(responseText);
            console.log("Parsed user data:", data.user);
          } catch (error) {
            console.error("JSON parse error:", error);
            throw new Error("サーバーからの応答が不正です");
          }

          if (!data.success) {
            throw new Error(
              data.error ||
                "認証に失敗しました。メールアドレスまたはパスワードが正しくありません。"
            );
          }

          const user = data.user;
          if (!user) {
            throw new Error("ユーザー情報の取得に失敗しました");
          }

          return {
            id: String(user.id),
            email: user.email,
            token: user.token_value || null,
            tokenId: user.token_id ? Number(user.token_id) : null,
            status: user.token_status || null,
            isAdmin: user.is_admin === "1" || user.is_admin === true,
            created_at: user.created_at || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error instanceof Error
            ? error
            : new Error("認証に失敗しました");
        }
      },
    }),
  ],
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.token = user.token;
        token.tokenId = user.tokenId;
        token.status = user.status;
        token.isAdmin = user.isAdmin;
        token.created_at = user.created_at;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.email) {
        session.user = {
          id: token.id,
          email: token.email,
          token: token.token ?? null,
          tokenId: token.tokenId ?? null,
          status: token.status ?? null,
          isAdmin: token.isAdmin ?? false,
          created_at: token.created_at,
        };
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// NextAuthハンドラーの作成
const handler = NextAuth(options);

export { handler as GET, handler as POST };
