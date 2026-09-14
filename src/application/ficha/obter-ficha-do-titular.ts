import type { FichaClinica } from "@/domain/entidades/ficha-clinica";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import { urlPublicaDaFicha } from "@/application/links";

export type FichaDoTitular = Omit<FichaClinica, "senhaPublicaHash"> & {
  urlPublica: string;
};

export class ObterFichaDoTitular {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly urlBase: string,
  ) {}

  async executar(usuarioId: string): Promise<FichaDoTitular | null> {
    const ficha = await this.fichas.buscarPorUsuario(usuarioId);
    if (!ficha) return null;

    // O hash da senha pública nunca sai da camada de aplicação.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senhaPublicaHash, ...dados } = ficha;
    return { ...dados, urlPublica: urlPublicaDaFicha(this.urlBase, ficha.slugPublico) };
  }
}
