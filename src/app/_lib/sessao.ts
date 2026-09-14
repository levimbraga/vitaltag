import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth/auth";

export interface UsuarioDaSessao {
  id: string;
  nome: string;
  email: string;
}

export async function usuarioDaSessao(): Promise<UsuarioDaSessao | null> {
  const sessao = await auth();
  if (!sessao?.user?.id) return null;
  return { id: sessao.user.id, nome: sessao.user.name ?? "", email: sessao.user.email ?? "" };
}

// Chamado em cada página da área autenticada: o layout sozinho não é
// reexecutado em toda navegação.
export async function exigirUsuario(): Promise<UsuarioDaSessao> {
  const usuario = await usuarioDaSessao();
  if (!usuario) redirect("/entrar");
  return usuario;
}
