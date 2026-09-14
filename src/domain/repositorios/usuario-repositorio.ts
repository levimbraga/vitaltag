import type { NovoUsuario, Usuario } from "@/domain/entidades/usuario";

export interface UsuarioRepositorio {
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorEmail(email: string): Promise<Usuario | null>;
  /** Lança ErroEmailJaCadastrado quando o e-mail já está em uso. */
  criar(dados: NovoUsuario): Promise<Usuario>;
  atualizarSenha(id: string, senhaHash: string): Promise<void>;
}
