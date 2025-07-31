import NextAuth, { AuthOptions, User } from "next-auth";
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
  interface Session {
    user: AuthUser;
  }
  interface User extends Omit<AuthUser, "name"> {
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string | number;
    email: string;
    token_id: number | null;
    token_value: string | null;
    status: string | null;
    created_at: string;
    is_admin: boolean;
    name?: string | null;
    sub: string;
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

if (!process.env.NEXTAUTH_SECRET) {
  console.error("Warning: NEXTAUTH_SECRET is not set");
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
      async authorize(credentials, req): Promise<User | null> {
        console.log("Starting authorization process");
        console.log("DATABASE_URL:", process.env.DATABASE_URL);

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        try {
          console.log("Attempting database connection...");
          // データベース接続テスト
          await prisma.$queryRaw`SELECT 1`;
          console.log("Database connection successful");

          console.log("Looking up user:", credentials.email);
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

          console.log("Verifying password");
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.error("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("Creating access log");
          await prisma.accessLog.create({
            data: {
              user_id: user.id,
              event: "user_authenticated",
            },
          });

          console.log("Authentication successful");
          return {
            id: String(user.id),
            email: user.email,
            token_id: user.token_id,
            token_value: user.token?.token_value || null,
            status: user.token?.status || null,
            created_at: user.created_at.toISOString(),
            is_admin: Boolean(user.is_admin),
            name: user.email,
            token: user.token?.token_value || null,
            tokenId: user.token_id,
            isAdmin: Boolean(user.is_admin),
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        } finally {
          // 本番環境ではコネクションを切断しない
          if (process.env.NODE_ENV !== "production") {
            await prisma.$disconnect();
          }
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
        token.token_id = user.token_id;
        token.token_value = user.token_value;
        token.status = user.status;
        token.created_at = user.created_at;
        token.is_admin = user.is_admin;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...token,
        id: Number(token.id),
      } as AuthUser;
      return session;
    },
  },
  debug: true, // デバッグモードを有効化
};

const handler = NextAuth(options);
export { handler as GET, handler as POST };
