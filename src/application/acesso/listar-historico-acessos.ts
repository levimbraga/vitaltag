import { ACESSOS_POR_PAGINA } from "@/domain/regras/politicas";
import type { AcessoPublicoRepositorio } from "@/domain/repositorios/acesso-publico-repositorio";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import { type HistoricoAcessosEntrada, historicoAcessosSchema } from "./esquemas";

export interface ItemHistorico {
  id: string;
  ocorridoEm: Date;
  sucesso: boolean;
}

export interface PaginaHistorico {
  itens: ItemHistorico[];
  pagina: number;
  totalPaginas: number;
  total: number;
}

// Recebe o id do usuário autenticado: o titular só enxerga a própria ficha.
export class ListarHistoricoAcessos {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly acessos: AcessoPublicoRepositorio,
  ) {}

  async executar(usuarioId: string, entrada: HistoricoAcessosEntrada): Promise<PaginaHistorico> {
    const { pagina } = historicoAcessosSchema.parse(entrada);

    const ficha = await this.fichas.buscarPorUsuario(usuarioId);
    if (!ficha) return { itens: [], pagina: 1, totalPaginas: 1, total: 0 };

    const { itens, total } = await this.acessos.listarPaginado(ficha.id, pagina, ACESSOS_POR_PAGINA);

    return {
      itens: itens.map(({ id, ocorridoEm, sucesso }) => ({ id, ocorridoEm, sucesso })),
      pagina,
      totalPaginas: Math.max(1, Math.ceil(total / ACESSOS_POR_PAGINA)),
      total,
    };
  }
}
