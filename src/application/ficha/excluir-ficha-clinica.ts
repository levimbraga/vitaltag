import { ErroFichaNaoEncontrada } from "@/domain/erros";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import { type ExcluirFichaEntrada, excluirFichaSchema } from "./esquemas";

// Apaga os dados clínicos definitivamente e preserva a conta. O slug deixa de
// existir, então o link público passa a responder como indisponível.
export class ExcluirFichaClinica {
  constructor(private readonly fichas: FichaClinicaRepositorio) {}

  async executar(usuarioId: string, entrada: ExcluirFichaEntrada): Promise<void> {
    excluirFichaSchema.parse(entrada);

    const ficha = await this.fichas.buscarPorUsuario(usuarioId);
    if (!ficha) throw new ErroFichaNaoEncontrada();

    await this.fichas.excluir(ficha.id);
  }
}
