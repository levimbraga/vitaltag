import { type FichaClinicaComTitular, nomeCompleto } from "@/domain/entidades/ficha-clinica";
import {
  avaliarBloqueio,
  deveNotificarBloqueio,
  JANELA_BLOQUEIO_MS,
} from "@/domain/regras/bloqueio-acesso";
import { RETENCAO_ACESSOS_MS } from "@/domain/regras/politicas";
import type { AcessoPublicoRepositorio } from "@/domain/repositorios/acesso-publico-repositorio";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import type { Relogio } from "@/domain/servicos/relogio";
import type { ServicoEmail } from "@/domain/servicos/servico-email";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import { formatarDataHora } from "@/application/formatacao";
import { slugPublicoSchema, type TentativaAcessoEntrada, tentativaAcessoSchema } from "./esquemas";
import { type FichaPublica, paraFichaPublica } from "./ficha-publica";

export type ResultadoAcessoPublico =
  | { status: "indisponivel" }
  | { status: "bloqueada"; liberaEm: Date }
  | { status: "senha_incorreta" }
  | { status: "liberada"; ficha: FichaPublica };

export class AcessarFichaPublica {
  constructor(
    private readonly fichas: FichaClinicaRepositorio,
    private readonly acessos: AcessoPublicoRepositorio,
    private readonly hash: ServicoHash,
    private readonly email: ServicoEmail,
    private readonly relogio: Relogio,
  ) {}

  async executar(entrada: TentativaAcessoEntrada): Promise<ResultadoAcessoPublico> {
    const dados = tentativaAcessoSchema.parse(entrada);
    if (!slugPublicoSchema.safeParse(dados.slug).success) return { status: "indisponivel" };

    const ficha = await this.fichas.buscarPorSlug(dados.slug);
    if (!ficha || !ficha.ativa) return { status: "indisponivel" };

    const agora = this.relogio.agora();
    // Duas janelas: uma para o bloqueio atual e outra para saber se já houve
    // bloqueio recente, o que decide a notificação ao titular.
    const anteriores = await this.acessos.listarTentativasDesde(
      ficha.id,
      new Date(agora.getTime() - 2 * JANELA_BLOQUEIO_MS),
    );

    const situacaoAtual = avaliarBloqueio(anteriores, agora);
    if (situacaoAtual.bloqueado) {
      // Tentativas durante o bloqueio não são verificadas nem gravadas; se
      // contassem como falha, o bloqueio nunca terminaria.
      return { status: "bloqueada", liberaEm: situacaoAtual.liberaEm };
    }

    const sucesso = await this.hash.verificar(ficha.senhaPublicaHash, dados.senha);
    await this.acessos.registrar({
      fichaId: ficha.id,
      ipOrigem: dados.ipOrigem,
      userAgent: dados.userAgent,
      sucesso,
      ocorridoEm: agora,
    });
    await this.acessos.removerAnterioresA(new Date(agora.getTime() - RETENCAO_ACESSOS_MS));

    if (sucesso) return { status: "liberada", ficha: paraFichaPublica(ficha) };

    const situacaoNova = avaliarBloqueio([...anteriores, { sucesso, ocorridoEm: agora }], agora);
    if (!situacaoNova.bloqueado) return { status: "senha_incorreta" };

    if (deveNotificarBloqueio(anteriores, agora)) {
      await this.notificarTitular(ficha, agora, situacaoNova.liberaEm);
    }
    return { status: "bloqueada", liberaEm: situacaoNova.liberaEm };
  }

  private async notificarTitular(ficha: FichaClinicaComTitular, ocorridoEm: Date, liberaEm: Date) {
    try {
      await this.email.enviar({
        para: ficha.titular.email,
        assunto: "Acesso à sua ficha do VitalTag bloqueado",
        texto: [
          `Olá, ${ficha.titular.nome}.`,
          "",
          `A ficha de ${nomeCompleto(ficha)} recebeu 5 tentativas de senha incorretas`,
          `e o acesso público foi bloqueado em ${formatarDataHora(ocorridoEm)}.`,
          `Novas tentativas serão aceitas a partir de ${formatarDataHora(liberaEm)}.`,
          "",
          "Se não foi você, considere gerar uma nova senha de acesso público no painel.",
        ].join("\n"),
      });
    } catch (erro) {
      // A notificação não pode impedir a resposta ao visitante.
      console.error("Falha ao notificar o titular sobre o bloqueio", erro);
    }
  }
}
