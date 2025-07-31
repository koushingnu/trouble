import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

// カスタムユーザー型
interface AuthUser {
  id: number;
  email: string;
  token_id: number | null;
  token_value: string | null;
  status: string | null;
  created_at: string;
  is_admin: boolean;
}

// NextAuthの型拡張
declare module "next-auth" {
  interface Session {
    user: AuthUser;
  }
  interface User extends AuthUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends AuthUser {}
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
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
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
          const authUser: AuthUser = {
            id: user.id,
            email: user.email,
            token_id: user.token_id,
            token_value: user.token?.token_value || null,
            status: user.token?.status || null,
            created_at: user.created_at.toISOString(),
            is_admin: Boolean(user.is_admin),
          };

          return authUser;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
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
        return { ...token, ...user };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token as AuthUser;
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
};

// NextAuthハンドラーの作成
const handler = NextAuth(options);

export { handler as GET, handler as POST };
