import { nomeCompleto } from "@/domain/entidades/ficha-clinica";
import { ErroFichaNaoEncontrada, ErroSenhaPublicaIncorreta } from "@/domain/erros";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import { urlPublicaDaFicha } from "@/application/links";
import { type DefinirSenhaPublicaEntrada, definirSenhaPublicaSchema } from "./esquemas";

export interface DadosCartao {
  nomeTitular: string;
  urlPublica: string;
  senhaPublica: string;
}

// Como a senha pública só existe em hash, o titular a informa novamente para
// imprimi-la no cartão; confiro contra o hash antes de gerar.
export class ObterDadosCartao {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly hash: ServicoHash,
    private readonly urlBase: string,
  ) {}

  async executar(usuarioId: string, entrada: DefinirSenhaPublicaEntrada): Promise<DadosCartao> {
    const { senhaPublica } = definirSenhaPublicaSchema.parse(entrada);

    const ficha = await this.fichas.buscarPorUsuario(usuarioId);
    if (!ficha) throw new ErroFichaNaoEncontrada();

    if (!(await this.hash.verificar(ficha.senhaPublicaHash, senhaPublica))) {
      throw new ErroSenhaPublicaIncorreta();
    }

    return {
      nomeTitular: nomeCompleto(ficha),
      urlPublica: urlPublicaDaFicha(this.urlBase, ficha.slugPublico),
      senhaPublica,
    };
  }
}
