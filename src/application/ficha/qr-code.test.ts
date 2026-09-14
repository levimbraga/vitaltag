import { beforeEach, describe, expect, it } from "vitest";
import { FichasEmMemoria, GeradorQrCodeFalso, UsuariosEmMemoria } from "@/application/_testes/dubles";
import { GerarQrCodeDaFicha } from "./gerar-qr-code-da-ficha";

const URL_BASE = "https://vitaltag.app";

let usuarios: UsuariosEmMemoria;
let fichas: FichasEmMemoria;
let gerador: GeradorQrCodeFalso;
let usuarioId: string;
let slugPublico: string;

beforeEach(async () => {
  usuarios = new UsuariosEmMemoria();
  fichas = new FichasEmMemoria(usuarios);
  gerador = new GeradorQrCodeFalso();
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

describe("GerarQrCodeDaFicha", () => {
  it("codifica apenas a URL pública da ficha, sem a senha", async () => {
    const resultado = await new GerarQrCodeDaFicha(fichas, gerador, `${URL_BASE}/`).svg(usuarioId);

    expect(resultado?.urlPublica).toBe(`${URL_BASE}/f/${slugPublico}`);
    expect(gerador.conteudos).toEqual([`${URL_BASE}/f/${slugPublico}`]);
    expect(gerador.conteudos[0]).not.toContain("4821");
  });

  it("gera PNG com no mínimo 512 pixels", async () => {
    const qrCode = new GerarQrCodeDaFicha(fichas, gerador, URL_BASE);

    await qrCode.png(usuarioId, 100);
    await qrCode.png(usuarioId, 1024);

    expect(gerador.tamanhos).toEqual([512, 1024]);
  });

  it("não gera nada para quem não tem ficha", async () => {
    const qrCode = new GerarQrCodeDaFicha(fichas, gerador, URL_BASE);

    expect(await qrCode.svg(crypto.randomUUID())).toBeNull();
    expect(gerador.conteudos).toHaveLength(0);
  });
});
