import { describe, expect, it } from "vitest";
import type { TentativaAcesso } from "@/domain/entidades/acesso-publico";
import { avaliarBloqueio, deveNotificarBloqueio } from "./bloqueio-acesso";

const MINUTO = 60 * 1000;
const agora = new Date("2026-09-14T12:00:00Z");

const minutosAtras = (minutos: number) => new Date(agora.getTime() - minutos * MINUTO);
const falha = (minutos: number): TentativaAcesso => ({ sucesso: false, ocorridoEm: minutosAtras(minutos) });
const sucesso = (minutos: number): TentativaAcesso => ({ sucesso: true, ocorridoEm: minutosAtras(minutos) });

describe("avaliarBloqueio", () => {
  it("libera o acesso com 4 falhas na janela", () => {
    const situacao = avaliarBloqueio([1, 2, 3, 4].map(falha), agora);

    expect(situacao).toEqual({ bloqueado: false, falhasNaJanela: 4 });
  });

  it("bloqueia com 5 falhas na janela até 15 minutos após a quinta falha mais recente", () => {
    const situacao = avaliarBloqueio([1, 2, 3, 4, 5].map(falha), agora);

    expect(situacao).toEqual({
      bloqueado: true,
      falhasNaJanela: 5,
      liberaEm: new Date(minutosAtras(5).getTime() + 15 * MINUTO),
    });
  });

  it("libera o acesso com 5 falhas quando a mais antiga está fora da janela", () => {
    const situacao = avaliarBloqueio([1, 2, 3, 4, 16].map(falha), agora);

    expect(situacao).toEqual({ bloqueado: false, falhasNaJanela: 4 });
  });

  it("desconsidera as falhas anteriores ao último sucesso", () => {
    const situacao = avaliarBloqueio([falha(1), falha(2), sucesso(3), falha(4), falha(5), falha(6)], agora);

    expect(situacao).toEqual({ bloqueado: false, falhasNaJanela: 2 });
  });

  it("dissolve o bloqueio no instante em que a quinta falha sai da janela", () => {
    const tentativas = [1, 2, 3, 4, 5].map(falha);
    const liberacao = new Date(minutosAtras(5).getTime() + 15 * MINUTO);

    expect(avaliarBloqueio(tentativas, new Date(liberacao.getTime() - 1)).bloqueado).toBe(true);
    expect(avaliarBloqueio(tentativas, liberacao).bloqueado).toBe(false);
  });
});

describe("deveNotificarBloqueio", () => {
  it("notifica o primeiro bloqueio de uma sequência", () => {
    expect(deveNotificarBloqueio([1, 2, 3, 4].map(falha), agora)).toBe(true);
  });

  it("não notifica de novo quando uma falha logo após a liberação bloqueia outra vez", () => {
    // Bloqueio disparado há 11 minutos pela falha de 11; liberado há pouco.
    expect(deveNotificarBloqueio([12, 13, 14, 15, 11].map(falha), agora)).toBe(false);
  });

  it("volta a notificar quando houve sucesso depois do bloqueio anterior", () => {
    const tentativas = [...[12, 13, 14, 15, 11].map(falha), sucesso(5), ...[1, 2, 3, 4].map(falha)];

    expect(deveNotificarBloqueio(tentativas, agora)).toBe(true);
  });
});
