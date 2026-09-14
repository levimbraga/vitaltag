import { describe, expect, it } from "vitest";
import { formatarAtualizacao } from "./formatacao";

describe("formatarAtualizacao", () => {
  it("usa o horário de Brasília no formato do protótipo", () => {
    expect(formatarAtualizacao(new Date("2026-08-30T17:22:00Z"))).toBe("30/08/2026, às 14h22");
  });

  it("mantém dois dígitos na hora da madrugada", () => {
    expect(formatarAtualizacao(new Date("2026-01-05T03:07:00Z"))).toBe("05/01/2026, às 00h07");
  });
});
