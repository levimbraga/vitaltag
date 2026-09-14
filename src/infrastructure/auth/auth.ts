import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { casosDeUso } from "@/infrastructure/container";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, senha: {} },
      async authorize(credenciais) {
        const usuario = await casosDeUso().autenticarUsuario.executar({
          email: String(credenciais.email ?? ""),
          senha: String(credenciais.senha ?? ""),
        });
        if (!usuario) return null;

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          impressaoSenha: usuario.impressaoSenha,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        return { ...token, sub: user.id, impressaoSenha: user.impressaoSenha };
      }

      // Confiro a impressão da senha a cada leitura da sessão: depois de uma
      // redefinição de senha, todas as sessões antigas deixam de valer.
      if (!token.sub || typeof token.impressaoSenha !== "string") return null;
      const usuario = await casosDeUso().validarSessao.executar({
        usuarioId: token.sub,
        impressaoSenha: token.impressaoSenha,
      });
      if (!usuario) return null;

      return { ...token, name: usuario.nome, email: usuario.email };
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
