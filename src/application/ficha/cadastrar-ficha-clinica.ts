import type { FichaClinica } from "@/domain/entidades/ficha-clinica";
import { ErroFichaJaExiste, ErroUsuarioNaoEncontrado } from "@/domain/erros";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import { type CadastroFichaEntrada, cadastroFichaSchema } from "./esquemas";
import { paraDadosFicha } from "./mapeamento";
import { garantirSenhaPublicaDistinta } from "./senha-publica";

export class CadastrarFichaClinica {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly usuarios: UsuarioRepositorio,
    private readonly hash: ServicoHash,
  ) {}

  async executar(usuarioId: string, entrada: CadastroFichaEntrada): Promise<FichaClinica> {
    const dados = cadastroFichaSchema.parse(entrada);

    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) throw new ErroUsuarioNaoEncontrado();
    if (await this.fichas.buscarPorUsuario(usuarioId)) throw new ErroFichaJaExiste();

    await garantirSenhaPublicaDistinta(this.hash, usuario.senhaHash, dados.senhaPublica);

    return this.fichas.criar(
      usuarioId,
      paraDadosFicha(dados),
      await this.hash.gerar(dados.senhaPublica),
    );
  }
}
