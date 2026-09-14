import { beforeEach, describe, expect, it } from "vitest";
import { ErroSenhaPublicaIncorreta } from "@/domain/erros";
import type { DadosCartaoImpressao, GeradorCartaoPdf } from "@/domain/servicos/gerador-cartao-pdf";
import {
  FichasEmMemoria,
  GeradorQrCodeFalso,
  HashFalso,
  UsuariosEmMemoria,
} from "@/application/_testes/dubles";
import { GerarCartaoPdf } from "./gerar-cartao-pdf";
import { ObterDadosCartao } from "./obter-dados-cartao";

const URL_BASE = "https://vitaltag.app";

class GeradorCartaoFalso implements GeradorCartaoPdf {
  recebidos: DadosCartaoImpressao[] = [];

  async gerar(dados: DadosCartaoImpressao): Promise<Uint8Array> {
    this.recebidos.push(dados);
    return new Uint8Array([0x25, 0x50, 0x44, 0x46]);
  }
}

let qrCode: GeradorQrCodeFalso;
let cartao: GeradorCartaoFalso;
let gerar: GerarCartaoPdf;
let usuarioId: string;
let slugPublico: string;

beforeEach(async () => {
  const usuarios = new UsuariosEmMemoria();
  const fichas = new FichasEmMemoria(usuarios);
  const hash = new HashFalso();
  qrCode = new GeradorQrCodeFalso();
  cartao = new GeradorCartaoFalso();
  gerar = new GerarCartaoPdf(new ObterDadosCartao(fichas, hash, URL_BASE), qrCode, cartao);

  const usuario = await usuarios.criar({ nome: "Carlos", email: "carlos@exemplo.com", senhaHash: "hash:conta1234" });
  usuarioId = usuario.id;
  const ficha = await fichas.criar(
    usuarioId,
    {
      nome: "Carlos",
      sobrenome: "Pereira",
      sexo: "MASCULINO",
      tipoSanguineo: "O_NEG",
      contatosEmergencia: [{ nome: "Marta", telefone: "51999990000", parentesco: "Esposa" }],
      registrosClinicos: [],
    },
    "hash:4821",
  );
  slugPublico = ficha.slugPublico;
});

describe("GerarCartaoPdf", () => {
  it("monta o cartão com nome, senha em campo próprio e QR Code só com a URL", async () => {
    const pdf = await gerar.executar(usuarioId, { senhaPublica: "4821" });

    const urlPublica = `${URL_BASE}/f/${slugPublico}`;
    expect(pdf.length).toBeGreaterThan(0);
    expect(cartao.recebidos).toHaveLength(1);
    expect(cartao.recebidos[0]).toMatchObject({ nomeTitular: "Carlos Pereira", senhaPublica: "4821", urlPublica });
    expect(qrCode.conteudos).toEqual([urlPublica]);
    expect(qrCode.conteudos[0]).not.toContain("4821");
  });

  it("não gera nada com a senha pública incorreta", async () => {
    await expect(gerar.executar(usuarioId, { senhaPublica: "0000" })).rejects.toBeInstanceOf(
      ErroSenhaPublicaIncorreta,
    );
    expect(cartao.recebidos).toHaveLength(0);
    expect(qrCode.conteudos).toHaveLength(0);
  });
});
