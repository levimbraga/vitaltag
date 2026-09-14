import type { NextAuthConfig } from "next-auth";
import { INATIVIDADE_SESSAO_SEGUNDOS } from "@/domain/regras/politicas";

// Parte da configuração que roda no middleware (Edge): não pode importar Prisma
// nem Argon2. A validação completa da sessão fica em auth.ts.
export const authConfig = {
  pages: { signIn: "/entrar" },
  // A cada requisição à área autenticada o cookie é renovado; sem atividade por
  // 30 minutos, o JWT expira.
  session: { strategy: "jwt", maxAge: INATIVIDADE_SESSAO_SEGUNDOS, updateAge: 0 },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
