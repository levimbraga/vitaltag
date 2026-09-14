import { describe, expect, it } from "vitest";
import { formatarAtualizacao, formatarData, formatarDataExtenso, formatarHora } from "./formatacao";

describe("formatação de datas", () => {
  const data = new Date("2026-08-30T17:22:00Z");

  it("usa o horário de Brasília no formato do protótipo", () => {
    expect(formatarAtualizacao(data)).toBe("30/08/2026, às 14h22");
    expect(formatarData(data)).toBe("30/08/2026");
    expect(formatarDataExtenso(data)).toBe("30 de agosto de 2026");
    expect(formatarHora(data)).toBe("14:22");
  });

  it("mantém dois dígitos na hora da madrugada e respeita a virada do dia", () => {
    const madrugada = new Date("2026-01-05T03:07:00Z");

    expect(formatarAtualizacao(madrugada)).toBe("05/01/2026, às 00h07");
    expect(formatarDataExtenso(new Date("2026-01-05T02:59:00Z"))).toBe("04 de janeiro de 2026");
  });
});
