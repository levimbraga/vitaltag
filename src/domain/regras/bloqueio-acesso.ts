import type { TentativaAcesso } from "@/domain/entidades/acesso-publico";

export const LIMITE_FALHAS = 5;
export const JANELA_BLOQUEIO_MS = 15 * 60 * 1000;

export type SituacaoBloqueio =
  | { bloqueado: false; falhasNaJanela: number }
  | { bloqueado: true; falhasNaJanela: number; liberaEm: Date };

function ordenarDaMaisRecente(tentativas: readonly TentativaAcesso[]): TentativaAcesso[] {
  return [...tentativas].sort((a, b) => b.ocorridoEm.getTime() - a.ocorridoEm.getTime());
}

/**
 * Janela deslizante: conto as falhas posteriores ao último sucesso que ocorreram
 * nos últimos 15 minutos. Com 5 ou mais, o acesso fica bloqueado até a quinta
 * falha mais recente sair da janela, e o bloqueio se desfaz sozinho.
 */
export function avaliarBloqueio(
  tentativas: readonly TentativaAcesso[],
  agora: Date,
): SituacaoBloqueio {
  const inicioJanela = agora.getTime() - JANELA_BLOQUEIO_MS;
  const falhas: Date[] = [];

  for (const tentativa of ordenarDaMaisRecente(tentativas)) {
    if (tentativa.ocorridoEm.getTime() <= inicioJanela || tentativa.sucesso) break;
    falhas.push(tentativa.ocorridoEm);
  }

  if (falhas.length < LIMITE_FALHAS) {
    return { bloqueado: false, falhasNaJanela: falhas.length };
  }

  const quintaMaisRecente = falhas[LIMITE_FALHAS - 1];
  return {
    bloqueado: true,
    falhasNaJanela: falhas.length,
    liberaEm: new Date(quintaMaisRecente.getTime() + JANELA_BLOQUEIO_MS),
  };
}

/**
 * Decide se a falha que acabou de gerar um bloqueio deve avisar o titular.
 * Aviso apenas o primeiro bloqueio de uma sequência: se outra falha dos últimos
 * 15 minutos, sem sucesso no meio, já tinha provocado bloqueio, o titular já
 * foi notificado. Sem essa regra, cada falha após a liberação geraria um e-mail.
 *
 * Recebe as tentativas anteriores à falha atual, cobrindo ao menos 30 minutos.
 */
export function deveNotificarBloqueio(
  tentativasAnteriores: readonly TentativaAcesso[],
  agora: Date,
): boolean {
  const inicioJanela = agora.getTime() - JANELA_BLOQUEIO_MS;
  const cronologicas = ordenarDaMaisRecente(tentativasAnteriores).reverse();
  const sequencia = cronologicas.slice(cronologicas.findLastIndex((t) => t.sucesso) + 1);

  const houveBloqueioRecente = sequencia.some(
    (falha, indice) =>
      falha.ocorridoEm.getTime() > inicioJanela &&
      avaliarBloqueio(sequencia.slice(0, indice + 1), falha.ocorridoEm).bloqueado,
  );

  return !houveBloqueioRecente;
}
