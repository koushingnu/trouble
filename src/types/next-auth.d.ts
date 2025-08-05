import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      is_admin: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    is_admin: boolean;
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