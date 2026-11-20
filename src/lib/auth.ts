import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma, { withRetry } from "./prisma";

// ログイン失敗の回数制限（同一アカウントへの総当たり対策）
const LOGIN_FAILURE_LIMIT = 10;
const LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;

// 管理者以外は、認証キーが使用中（ACTIVE）の場合のみ利用可能（退会・未契約は不可）
function canUseService(user: {
  is_admin: boolean;
  token: { status: string } | null;
}): boolean {
  return user.is_admin || user.token?.status === "ACTIVE";
}

export const authOptions: AuthOptions = {
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
            return null;
          }

          const user = await withRetry(() =>
            prisma.user.findUnique({
              where: {
                email: credentials.email,
              },
              include: {
                token: { select: { status: true } },
              },
            })
          );

          if (!user) {
            return null;
          }

          const recentFailures = await prisma.accessLog.count({
            where: {
              user_id: user.id,
              event: "login_failed",
              created_at: {
                gte: new Date(Date.now() - LOGIN_FAILURE_WINDOW_MS),
              },
            },
          });
          if (recentFailures >= LOGIN_FAILURE_LIMIT) {
            console.warn("[AUTH] Login locked (too many failures), user:", user.id);
            throw new Error("LOCKED");
          }

          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            await prisma.accessLog.create({
              data: { user_id: user.id, event: "login_failed" },
            });
            return null;
          }

          if (!canUseService(user)) {
            console.warn("[AUTH] Login denied (contract inactive), user:", user.id);
            throw new Error("CONTRACT_INACTIVE");
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
            is_admin: user.is_admin,
          };
        } catch (error) {
          // ロック・契約終了はログイン画面に理由を表示するためそのまま返す
          if (
            error instanceof Error &&
            (error.message === "LOCKED" || error.message === "CONTRACT_INACTIVE")
          ) {
            throw error;
          }
          console.error("[AUTH] Error:", error);
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
      
      // JWTトークンが存在する場合、ユーザーがまだデータベースに存在するか確認
      if (token.id) {
        try {
          const existingUser = await withRetry(() =>
            prisma.user.findUnique({
              where: { id: Number(token.id) },
              select: {
                id: true,
                email: true,
                is_admin: true,
                token: { select: { status: true } },
              },
            })
          );

          // ユーザーが削除されている場合、トークンを無効化
          if (!existingUser) {
            console.log("[AUTH] User no longer exists in database:", token.id);
            return null as any; // トークンを無効化
          }

          // ログイン中に退会（認証キー無効化）された場合もセッションを無効化
          if (!canUseService(existingUser)) {
            console.log("[AUTH] Session revoked (contract inactive), user:", token.id);
            return null as any;
          }
          
          // ユーザー情報を最新の状態に更新
          token.email = existingUser.email;
          token.is_admin = existingUser.is_admin;
        } catch (error) {
          console.error("[AUTH] Error checking user existence:", error);
          return null as any; // エラー時もトークンを無効化
        }
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
};

