import type { FichaClinica } from "@/domain/entidades/ficha-clinica";
import { ErroFichaNaoEncontrada } from "@/domain/erros";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import { type DadosFichaEntrada, dadosFichaSchema } from "./esquemas";
import { paraDadosFicha } from "./mapeamento";

export class AtualizarFichaClinica {
  constructor(private readonly fichas: FichaClinicaRepositorio) {}

  async executar(usuarioId: string, entrada: DadosFichaEntrada): Promise<FichaClinica> {
    const dados = dadosFichaSchema.parse(entrada);

    const ficha = await this.fichas.buscarPorUsuario(usuarioId);
    if (!ficha) throw new ErroFichaNaoEncontrada();

    return this.fichas.atualizar(ficha.id, paraDadosFicha(dados));
  }
}
