import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 基本的なユーザー情報の型
interface CustomUser {
  id: string;
  email: string;
  token: string | null;
  tokenId: number | null;
  status: string | null;
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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    token: string | null;
    tokenId: number | null;
    status: string | null;
  }
}

const API_BASE = "https://ttsv.sakura.ne.jp/api.php";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.token) {
          throw new Error("メールアドレスと認証キーを入力してください");
        }

        try {
          const response = await fetch(`${API_BASE}?action=login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${process.env.API_AUTH}`,
            },
            body: new URLSearchParams({
              email: credentials.email,
              token: credentials.token,
            }).toString(),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "認証に失敗しました");
          }

          const data = await response.json();
          const user = data.data;

          if (!user) {
            throw new Error("ユーザー情報の取得に失敗しました");
          }

          return {
            id: String(user.id),
            email: user.email,
            token: user.token_value,
            tokenId: user.token_id ? Number(user.token_id) : null,
            status: user.status,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.token = user.token;
        token.tokenId = user.tokenId;
        token.status = user.status;
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
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
