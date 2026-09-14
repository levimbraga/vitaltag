import type { PrismaClient } from "@prisma/client";
import type { NovoAcessoPublico, TentativaAcesso } from "@/domain/entidades/acesso-publico";
import type {
  AcessoPublicoRepositorio,
  PaginaAcessos,
} from "@/domain/repositorios/acesso-publico-repositorio";

export class PrismaAcessoPublicoRepositorio implements AcessoPublicoRepositorio {
  constructor(private readonly db: PrismaClient) {}

  async registrar(acesso: NovoAcessoPublico): Promise<void> {
    await this.db.acessoPublico.create({ data: acesso });
  }

  listarTentativasDesde(fichaId: string, desde: Date): Promise<TentativaAcesso[]> {
    return this.db.acessoPublico.findMany({
      where: { fichaId, ocorridoEm: { gte: desde } },
      select: { sucesso: true, ocorridoEm: true },
      orderBy: { ocorridoEm: "desc" },
    });
  }

  async listarPaginado(fichaId: string, pagina: number, porPagina: number): Promise<PaginaAcessos> {
    const [itens, total] = await this.db.$transaction([
      this.db.acessoPublico.findMany({
        where: { fichaId },
        orderBy: [{ ocorridoEm: "desc" }, { id: "desc" }],
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      this.db.acessoPublico.count({ where: { fichaId } }),
    ]);
    return { itens, total };
  }

  async removerAnterioresA(data: Date): Promise<number> {
    const { count } = await this.db.acessoPublico.deleteMany({ where: { ocorridoEm: { lt: data } } });
    return count;
  }
}
