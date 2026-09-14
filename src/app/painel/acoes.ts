"use server";

import { signOut } from "@/infrastructure/auth/auth";

// O redirecionamento é feito no navegador com navegação completa, para descartar
// o cache do roteador e impedir que o botão voltar restaure o painel.
export async function sair(): Promise<void> {
  await signOut({ redirect: false });
}
