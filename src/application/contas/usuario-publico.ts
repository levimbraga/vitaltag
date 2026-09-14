import type { Usuario } from "@/domain/entidades/usuario";

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
}

export function paraUsuarioPublico(usuario: Usuario): UsuarioPublico {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}
