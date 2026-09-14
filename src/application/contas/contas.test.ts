import { beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { ErroEmailJaCadastrado, ErroTokenInvalido } from "@/domain/erros";
import {
  EmailFalso,
  HashFalso,
  ImpressaoFalsa,
  MINUTO,
  RelogioControlado,
  TokenFalso,
  UsuariosEmMemoria,
} from "@/application/_testes/dubles";
import { AutenticarUsuario } from "./autenticar-usuario";
import { CadastrarUsuario } from "./cadastrar-usuario";
import { RedefinirSenha } from "./redefinir-senha";
import { SolicitarRedefinicaoSenha } from "./solicitar-redefinicao-senha";
import { ValidarSessao } from "./validar-sessao";

let usuarios: UsuariosEmMemoria;
let hash: HashFalso;
let impressao: ImpressaoFalsa;
let tokens: TokenFalso;
let email: EmailFalso;
let relogio: RelogioControlado;

beforeEach(() => {
  usuarios = new UsuariosEmMemoria();
  hash = new HashFalso();
  impressao = new ImpressaoFalsa();
  tokens = new TokenFalso();
  email = new EmailFalso();
  relogio = new RelogioControlado();
});

const cadastrar = (dados = { nome: "Ana Souza", email: "ana@exemplo.com", senha: "segura123" }) =>
  new CadastrarUsuario(usuarios, hash).executar(dados);

describe("CadastrarUsuario", () => {
  it("cria a conta com a senha em hash e o e-mail normalizado", async () => {
    const usuario = await cadastrar({ nome: " Ana ", email: " ANA@Exemplo.com ", senha: "segura123" });

    expect(usuario).toMatchObject({ nome: "Ana", email: "ana@exemplo.com" });
    expect(usuarios.itens[0].senhaHash).toBe("hash:segura123");
  });

  it("recusa e-mail já cadastrado", async () => {
    await cadastrar();

    await expect(cadastrar()).rejects.toBeInstanceOf(ErroEmailJaCadastrado);
  });

  it.each([
    ["curta", "abc123"],
    ["sem número", "somenteletras"],
    ["sem letra", "12345678"],
  ])("recusa senha %s", async (_, senha) => {
    await expect(cadastrar({ nome: "Ana", email: "ana@exemplo.com", senha })).rejects.toBeInstanceOf(ZodError);
  });
});

describe("AutenticarUsuario", () => {
  const autenticar = (emailInformado: string, senha: string) =>
    new AutenticarUsuario(usuarios, hash, impressao).executar({ email: emailInformado, senha });

  it("autentica com credenciais corretas e devolve a impressão da senha", async () => {
    await cadastrar();

    const usuario = await autenticar("ana@exemplo.com", "segura123");

    expect(usuario).toMatchObject({ email: "ana@exemplo.com", impressaoSenha: "impressao:hash:segura123" });
  });

  it("devolve null para senha incorreta", async () => {
    await cadastrar();

    expect(await autenticar("ana@exemplo.com", "errada123")).toBeNull();
  });

  it("devolve null para e-mail inexistente, ainda calculando um hash", async () => {
    expect(await autenticar("ninguem@exemplo.com", "segura123")).toBeNull();
    expect(hash.chamadasGerar).toBe(1);
  });
});

describe("recuperação de senha", () => {
  const solicitar = (emailInformado: string) =>
    new SolicitarRedefinicaoSenha(usuarios, tokens, impressao, email, relogio, "https://vitaltag.app/").executar({
      email: emailInformado,
    });
  const redefinir = (token: string, senha = "nova1234") =>
    new RedefinirSenha(usuarios, tokens, impressao, hash, relogio).executar({ token, senha, confirmacao: senha });
  const tokenDoEmail = () => {
    const link = email.enviados.at(-1)!.texto.match(/https:\S+/)![0];
    return new URL(link).searchParams.get("token")!;
  };

  it("envia o link de redefinição para um e-mail cadastrado", async () => {
    await cadastrar();

    await solicitar("ana@exemplo.com");

    expect(email.enviados).toHaveLength(1);
    expect(email.enviados[0].texto).toContain("https://vitaltag.app/redefinir-senha?token=");
  });

  it("termina sem erro e sem envio para e-mail inexistente", async () => {
    await expect(solicitar("ninguem@exemplo.com")).resolves.toBeUndefined();
    expect(email.enviados).toHaveLength(0);
  });

  it("troca a senha com um link válido", async () => {
    await cadastrar();
    await solicitar("ana@exemplo.com");

    await redefinir(tokenDoEmail());

    expect(usuarios.itens[0].senhaHash).toBe("hash:nova1234");
  });

  it("recusa o link após 30 minutos", async () => {
    await cadastrar();
    await solicitar("ana@exemplo.com");
    relogio.avancar(30 * MINUTO);

    await expect(redefinir(tokenDoEmail())).rejects.toBeInstanceOf(ErroTokenInvalido);
  });

  it("recusa o mesmo link numa segunda troca", async () => {
    await cadastrar();
    await solicitar("ana@exemplo.com");
    const token = tokenDoEmail();
    await redefinir(token);

    await expect(redefinir(token, "outra1234")).rejects.toBeInstanceOf(ErroTokenInvalido);
  });

  it("recusa token adulterado", async () => {
    await expect(redefinir("nao-e-um-token")).rejects.toBeInstanceOf(ErroTokenInvalido);
  });

  it("invalida as sessões abertas antes da troca", async () => {
    const usuario = await cadastrar();
    const impressaoAntiga = impressao.calcular(usuarios.itens[0].senhaHash);
    const validarSessao = new ValidarSessao(usuarios, impressao);
    await solicitar("ana@exemplo.com");

    expect(await validarSessao.executar({ usuarioId: usuario.id, impressaoSenha: impressaoAntiga })).not.toBeNull();
    await redefinir(tokenDoEmail());
    expect(await validarSessao.executar({ usuarioId: usuario.id, impressaoSenha: impressaoAntiga })).toBeNull();
  });
});
