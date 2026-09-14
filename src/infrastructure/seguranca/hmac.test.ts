import { describe, expect, it } from "vitest";
import { HmacImpressaoSenha, HmacTokenRedefinicao } from "./hmac";

const SEGREDO = "segredo-de-teste-com-tamanho-suficiente";
const dados = {
  usuarioId: "3f1c7a52-8f0e-4d8a-9a51-2b6f4c1d9e77",
  expiraEm: new Date("2026-09-14T12:30:00Z"),
  impressaoSenha: "abc123",
};

describe("HmacTokenRedefinicao", () => {
  it("lê de volta os dados do token que emitiu", () => {
    const servico = new HmacTokenRedefinicao(SEGREDO);

    expect(servico.ler(servico.emitir(dados))).toEqual(dados);
  });

  it("recusa token com conteúdo adulterado", () => {
    const servico = new HmacTokenRedefinicao(SEGREDO);
    const [, assinatura] = servico.emitir(dados).split(".");
    const outroConteudo = Buffer.from(JSON.stringify({ u: "outro", e: 0, i: "x" })).toString("base64url");

    expect(servico.ler(`${outroConteudo}.${assinatura}`)).toBeNull();
  });

  it("recusa token assinado com outro segredo ou malformado", () => {
    const token = new HmacTokenRedefinicao("outro-segredo-com-tamanho-suficiente").emitir(dados);
    const servico = new HmacTokenRedefinicao(SEGREDO);

    expect(servico.ler(token)).toBeNull();
    expect(servico.ler("sem-ponto")).toBeNull();
    expect(servico.ler("a.b.c")).toBeNull();
  });
});

describe("HmacImpressaoSenha", () => {
  it("muda quando o hash da senha muda", () => {
    const impressao = new HmacImpressaoSenha(SEGREDO);

    expect(impressao.calcular("hash-1")).toBe(impressao.calcular("hash-1"));
    expect(impressao.calcular("hash-1")).not.toBe(impressao.calcular("hash-2"));
  });
});
