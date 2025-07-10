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
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          throw new Error("メールアドレスとパスワードを入力してください");
        }

        try {
          console.log("Attempting login with:", {
            email: credentials.email,
            passwordLength: credentials.password.length,
          });

          // URLSearchParamsを使用してクエリパラメータとフォームデータを構築
          const url = new URL(API_BASE);
          url.searchParams.append("action", "authenticate");

          const formData = new URLSearchParams();
          formData.append("email", credentials.email);
          formData.append("password", credentials.password);

          console.log("Request URL:", url.toString());
          console.log("Form data:", formData.toString());

          const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${process.env.API_AUTH}`,
            },
            body: formData.toString(),
          });

          console.log("API Response status:", response.status);
          const responseText = await response.text();
          console.log("API Response body:", responseText);

          if (!response.ok) {
            throw new Error(
              `API responded with status ${response.status}: ${responseText}`
            );
          }

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error("Failed to parse JSON response:", e);
            throw new Error("Invalid JSON response from API");
          }

          if (!data.success) {
            throw new Error(data.error || "認証に失敗しました");
          }

          const user = data.user;
          if (!user) {
            throw new Error("ユーザー情報の取得に失敗しました");
          }

          console.log("Login successful for:", user.email);

          return {
            id: String(user.id),
            email: user.email,
            token: user.token_value || null,
            tokenId: user.token_id ? Number(user.token_id) : null,
            status: user.status || null,
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
  debug: true,
});

export { handler as GET, handler as POST };
