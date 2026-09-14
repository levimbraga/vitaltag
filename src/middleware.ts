import NextAuth from "next-auth";
import { authConfig } from "@/infrastructure/auth/auth.config";

// Protege a área autenticada e renova o cookie de sessão a cada requisição,
// o que implementa a expiração por inatividade.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/painel/:path*"],
};
