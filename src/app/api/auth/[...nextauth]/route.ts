import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

// 基本的なユーザー情報の型
interface CustomUser {
  id: number;
  email: string;
  token_id: number | null;
  created_at: string;
}

declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }
  interface User {
    id: number;
    email: string;
    token_id: number | null;
    created_at: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    token_id: number | null;
    created_at: string;
  }
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
          // Prismaを使用してユーザーを検索
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              token: true,
            },
          });

          if (!user) {
            throw new Error("ユーザーが見つかりません");
          }

          // パスワードの検証
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("パスワードが正しくありません");
          }

          // アクセスログの記録
          await prisma.accessLog.create({
            data: {
              user_id: user.id,
              event: "user_login",
            },
          });

          return {
            id: user.id,
            email: user.email,
            token_id: user.token_id,
            created_at: user.created_at.toISOString(),
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error instanceof Error
            ? error
            : new Error("認証に失敗しました");
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
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
        token.token_id = user.token_id;
        token.created_at = user.created_at;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          token_id: token.token_id,
          created_at: token.created_at,
        };
      }
      return session;
    },
  },
  debug: true,
};

// NextAuthハンドラーの作成
const handler = NextAuth(options);

export { handler as GET, handler as POST };
