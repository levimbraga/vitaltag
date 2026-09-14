import type {
  AcessoPublico,
  NovoAcessoPublico,
  TentativaAcesso,
} from "@/domain/entidades/acesso-publico";

export interface PaginaAcessos {
  itens: AcessoPublico[];
  total: number;
}

export interface AcessoPublicoRepositorio {
  registrar(acesso: NovoAcessoPublico): Promise<void>;
  listarTentativasDesde(fichaId: string, desde: Date): Promise<TentativaAcesso[]>;
  /** Mais recentes primeiro; a página começa em 1. */
  listarPaginado(fichaId: string, pagina: number, porPagina: number): Promise<PaginaAcessos>;
  removerAnterioresA(data: Date): Promise<number>;
}
