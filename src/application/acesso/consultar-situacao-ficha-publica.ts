import { avaliarBloqueio, JANELA_BLOQUEIO_MS } from "@/domain/regras/bloqueio-acesso";
import type { AcessoPublicoRepositorio } from "@/domain/repositorios/acesso-publico-repositorio";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import type { Relogio } from "@/domain/servicos/relogio";
import { slugPublicoSchema } from "./esquemas";

export type SituacaoFichaPublica =
  | { status: "indisponivel" }
  | { status: "disponivel" }
  | { status: "bloqueada"; liberaEm: Date };

// Usado ao abrir a página pública, antes de qualquer senha ser digitada.
export class ConsultarSituacaoFichaPublica {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly acessos: AcessoPublicoRepositorio,
    private readonly relogio: Relogio,
  ) {}

  async executar(slug: string): Promise<SituacaoFichaPublica> {
    if (!slugPublicoSchema.safeParse(slug).success) return { status: "indisponivel" };

    const ficha = await this.fichas.buscarPorSlug(slug);
    if (!ficha || !ficha.ativa) return { status: "indisponivel" };

    const agora = this.relogio.agora();
    const tentativas = await this.acessos.listarTentativasDesde(
      ficha.id,
      new Date(agora.getTime() - JANELA_BLOQUEIO_MS),
    );
    const situacao = avaliarBloqueio(tentativas, agora);

    return situacao.bloqueado
      ? { status: "bloqueada", liberaEm: situacao.liberaEm }
      : { status: "disponivel" };
  }
}
