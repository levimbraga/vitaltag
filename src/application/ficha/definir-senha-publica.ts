import { ErroFichaNaoEncontrada, ErroUsuarioNaoEncontrado } from "@/domain/erros";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import { type DefinirSenhaPublicaEntrada, definirSenhaPublicaSchema } from "./esquemas";
import { garantirSenhaPublicaDistinta } from "./senha-publica";

export class DefinirSenhaPublica {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly usuarios: UsuarioRepositorio,
    private readonly hash: ServicoHash,
  ) {}

  async executar(usuarioId: string, entrada: DefinirSenhaPublicaEntrada): Promise<void> {
    const { senhaPublica } = definirSenhaPublicaSchema.parse(entrada);

    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new ErroUsuarioNaoEncontrado();

    const ficha = await this.fichas.buscarPorUsuario(usuarioId);
    if (!ficha) throw new ErroFichaNaoEncontrada();

    await garantirSenhaPublicaDistinta(this.hash, usuario.senhaHash, senhaPublica);
    await this.fichas.atualizarSenhaPublica(ficha.id, await this.hash.gerar(senhaPublica));
  }
}
