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
  is_admin: boolean;
}

declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }
  interface User extends CustomUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends CustomUser {}
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
          });

          if (!user) {
            console.error("User not found:", credentials.email);
            return null;
          }

          // パスワードの検証
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.error("Invalid password for user:", credentials.email);
            return null;
          }

          // アクセスログの記録
          await prisma.accessLog.create({
            data: {
              user_id: user.id,
              event: "user_authenticated",
            },
          });

          // 認証成功時のユーザー情報を返す
          return {
            id: user.id,
            email: user.email,
            token_id: user.token_id,
            created_at: user.created_at.toISOString(),
            is_admin: user.is_admin,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
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
        token.is_admin = user.is_admin;
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
          is_admin: token.is_admin,
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
