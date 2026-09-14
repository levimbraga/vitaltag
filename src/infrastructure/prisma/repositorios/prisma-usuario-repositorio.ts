import type { PrismaClient } from "@prisma/client";
import type { NovoUsuario, Usuario } from "@/domain/entidades/usuario";
import { ErroEmailJaCadastrado } from "@/domain/erros";
import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import { ehUuid, violouUnicidade } from "../utilitarios";

export class PrismaUsuarioRepositorio implements UsuarioRepositorio {
  constructor(private readonly db: PrismaClient) {}

  async buscarPorId(id: string): Promise<Usuario | null> {
    if (!ehUuid(id)) return null;
    return this.db.usuario.findUnique({ where: { id } });
  }

  buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.db.usuario.findUnique({ where: { email } });
  }

  async criar(dados: NovoUsuario): Promise<Usuario> {
    try {
      return await this.db.usuario.create({ data: dados });
    } catch (erro) {
      if (violouUnicidade(erro)) throw new ErroEmailJaCadastrado();
      throw erro;
    }
  }

  async atualizarSenha(id: string, senhaHash: string): Promise<void> {
    await this.db.usuario.update({ where: { id }, data: { senhaHash } });
  }
}
