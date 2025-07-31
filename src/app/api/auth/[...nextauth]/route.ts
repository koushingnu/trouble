import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

// PrismaClientのインスタンスをグローバルに保持
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

// カスタムユーザー型
type AuthUser = {
  id: number;
  email: string;
  token_id: number | null;
  token_value: string | null;
  status: string | null;
  created_at: string;
  is_admin: boolean;
  name?: string;
};

// NextAuthの型拡張
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    is_admin: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      is_admin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    is_admin: boolean;
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 環境変数のチェック
if (!process.env.NEXTAUTH_URL) {
  console.error("Warning: NEXTAUTH_URL is", process.env.NEXTAUTH_URL);
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error("Warning: NEXTAUTH_SECRET is not set");
}
if (!process.env.DATABASE_URL) {
  console.error("Warning: DATABASE_URL is not set");
}

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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("Missing credentials");
            return null;
          }

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

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.error("Invalid password for user:", credentials.email);
            return null;
          }

          await prisma.accessLog.create({
            data: {
              user_id: user.id,
              event: "user_authenticated",
            },
          });

          return {
            id: String(user.id),
            email: user.email,
            name: user.email,
            is_admin: Boolean(user.is_admin),
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.is_admin = user.is_admin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.is_admin = token.is_admin;
      }
      return session;
    },
  },
  debug: true, // デバッグモードを有効化
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
