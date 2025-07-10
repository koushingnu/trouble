import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      token: string | null;
      tokenId: number | null;
      status: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    token: string | null;
    tokenId: number | null;
    status: string | null;
  }
}
