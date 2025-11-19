import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "./prisma";

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
          console.log("[AUTH] Login attempt for:", credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log("[AUTH] Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.log("[AUTH] User not found:", credentials.email);
            return null;
          }

          console.log("[AUTH] User found, ID:", user.id);
          console.log("[AUTH] Input password length:", credentials.password.length);
          console.log("[AUTH] Stored hash starts with:", user.password.substring(0, 10));

          const isValid = await compare(credentials.password, user.password);
          console.log("[AUTH] Password validation result:", isValid);
          
          if (!isValid) {
            console.log("[AUTH] Password mismatch for user:", credentials.email);
            return null;
          }

          await prisma.accessLog.create({
            data: {
              user_id: user.id,
              event: "user_authenticated",
            },
          });

          console.log("[AUTH] Login successful for user:", user.id);
          return {
            id: String(user.id),
            email: user.email,
            name: user.email,
            is_admin: user.is_admin,
          };
        } catch (error) {
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

