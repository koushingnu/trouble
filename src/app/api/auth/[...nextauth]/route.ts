import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("メールアドレスとパスワードを入力してください");
        }

        try {
          // デバッグ: 認証リクエストの内容をログに出力
          console.log("Auth request:", {
            url: `${process.env.NEXT_PUBLIC_API_BASE}?action=authenticate`,
            credentials: {
              email: credentials.email,
              password: "***",
            },
          });

          // 認証エンドポイントを呼び出し
          const authResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE}?action=authenticate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${process.env.API_AUTH}`,
              },
              body: new URLSearchParams({
                email: credentials.email,
                password: credentials.password,
              }).toString(),
            }
          );

          // デバッグ: レスポンスの内容をログに出力
          const responseText = await authResponse.text();
          console.log("Auth response:", {
            status: authResponse.status,
            headers: Object.fromEntries(authResponse.headers),
            body: responseText,
          });

          let data;
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error("JSON parse error:", e);
            throw new Error("Invalid JSON response");
          }

          if (!authResponse.ok || !data.success) {
            throw new Error(data.error || "認証に失敗しました");
          }

          const user = data.user;
          return {
            id: user.id.toString(),
            email: user.email,
            token: user.token_value,
            tokenId: user.token_id,
            status: user.token_status,
          };
        } catch (error) {
          console.error("認証エラー:", error);
          throw error;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
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
        token.token = user.token;
        token.tokenId = user.tokenId;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.token = token.token;
        session.user.tokenId = token.tokenId;
        session.user.status = token.status;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
