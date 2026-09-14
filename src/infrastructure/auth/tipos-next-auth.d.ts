import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    impressaoSenha?: string;
  }

  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    impressaoSenha?: string;
  }
}
