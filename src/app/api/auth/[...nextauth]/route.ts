import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

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
  interface User extends CustomUser {}
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
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: credentials.email,
                token: credentials.token,
              }),
            }
          );

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
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          token: token.token,
          tokenId: token.tokenId,
          status: token.status,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
