import { beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import {
  ErroFichaJaExiste,
  ErroFichaNaoEncontrada,
  ErroSenhaPublicaIgualSenhaConta,
  ErroSenhaPublicaIncorreta,
} from "@/domain/erros";
import { FichasEmMemoria, HashFalso, UsuariosEmMemoria } from "@/application/_testes/dubles";
import { AtualizarFichaClinica } from "./atualizar-ficha-clinica";
import { CadastrarFichaClinica } from "./cadastrar-ficha-clinica";
import { DefinirSenhaPublica } from "./definir-senha-publica";
import type { CadastroFichaEntrada, DadosFichaEntrada } from "./esquemas";
import { ExcluirFichaClinica } from "./excluir-ficha-clinica";
import { ObterDadosCartao } from "./obter-dados-cartao";
import { ObterFichaDoTitular } from "./obter-ficha-do-titular";

const URL_BASE = "https://vitaltag.app";

let usuarios: UsuariosEmMemoria;
let fichas: FichasEmMemoria;
let hash: HashFalso;
let usuarioId: string;

const dadosValidos = (): DadosFichaEntrada => ({
  nome: "Carlos",
  sobrenome: "Pereira",
  sexo: "MASCULINO",
  tipoSanguineo: "O_NEG",
  contatosEmergencia: [{ nome: "Marta Pereira", telefone: "(51) 99999-0000", parentesco: "Esposa" }],
  alergias: [{ descricao: "Dipirona" }, { descricao: "Amendoim", observacao: "Anafilaxia" }],
  medicamentos: [{ descricao: "Losartana 50 mg" }],
});

const entradaValida = (): CadastroFichaEntrada => ({ ...dadosValidos(), senhaPublica: "4821" });

const cadastrarFicha = (entrada = entradaValida()) =>
  new CadastrarFichaClinica(fichas, usuarios, hash).executar(usuarioId, entrada);

beforeEach(async () => {
  usuarios = new UsuariosEmMemoria();
  fichas = new FichasEmMemoria(usuarios);
  hash = new HashFalso();
  const usuario = await usuarios.criar({ nome: "Carlos", email: "carlos@exemplo.com", senhaHash: "hash:conta1234" });
  usuarioId = usuario.id;
});

describe("CadastrarFichaClinica", () => {
  it("grava as listas como registros clínicos do tipo correspondente", async () => {
    const ficha = await cadastrarFicha();

    expect(ficha.registrosClinicos.map(({ tipo, descricao, observacao }) => ({ tipo, descricao, observacao }))).toEqual([
      { tipo: "ALERGIA", descricao: "Dipirona", observacao: null },
      { tipo: "ALERGIA", descricao: "Amendoim", observacao: "Anafilaxia" },
      { tipo: "MEDICAMENTO", descricao: "Losartana 50 mg", observacao: null },
    ]);
    expect(ficha.senhaPublicaHash).toBe("hash:4821");
  });

  it("exige nome, sobrenome, tipo sanguíneo e contato de emergência", async () => {
    const semObrigatorios = { ...entradaValida(), nome: " ", sobrenome: "", contatosEmergencia: [] };

    await expect(cadastrarFicha(semObrigatorios)).rejects.toBeInstanceOf(ZodError);
    await expect(cadastrarFicha({ ...entradaValida(), tipoSanguineo: "X" as never })).rejects.toBeInstanceOf(ZodError);
  });

  it("recusa uma segunda ficha para o mesmo usuário", async () => {
    await cadastrarFicha();

    await expect(cadastrarFicha()).rejects.toBeInstanceOf(ErroFichaJaExiste);
  });

  it.each(["123", "123456789", "12 34"])("recusa a senha pública %s", async (senhaPublica) => {
    await expect(cadastrarFicha({ ...entradaValida(), senhaPublica })).rejects.toBeInstanceOf(ZodError);
  });

  it("recusa senha pública igual à senha da conta", async () => {
    usuarios.itens[0].senhaHash = "hash:abc12345";

    await expect(cadastrarFicha({ ...entradaValida(), senhaPublica: "abc12345" })).rejects.toBeInstanceOf(
      ErroSenhaPublicaIgualSenhaConta,
    );
  });
});

describe("AtualizarFichaClinica", () => {
  it("substitui os dados e preserva o slug público", async () => {
    const original = await cadastrarFicha();

    const atualizada = await new AtualizarFichaClinica(fichas).executar(usuarioId, {
      ...dadosValidos(),
      tipoSanguineo: "A_POS",
      alergias: [],
    });

    expect(atualizada.slugPublico).toBe(original.slugPublico);
    expect(atualizada.tipoSanguineo).toBe("A_POS");
    expect(atualizada.registrosClinicos.map((registro) => registro.tipo)).toEqual(["MEDICAMENTO"]);
  });

  it("falha quando o usuário não tem ficha", async () => {
    await expect(new AtualizarFichaClinica(fichas).executar(usuarioId, dadosValidos())).rejects.toBeInstanceOf(
      ErroFichaNaoEncontrada,
    );
  });
});

describe("ObterFichaDoTitular", () => {
  it("devolve a URL pública sem expor o hash da senha pública", async () => {
    const ficha = await cadastrarFicha();

    const resultado = await new ObterFichaDoTitular(fichas, URL_BASE).executar(usuarioId);

    expect(resultado?.urlPublica).toBe(`${URL_BASE}/f/${ficha.slugPublico}`);
    expect(resultado).not.toHaveProperty("senhaPublicaHash");
  });
});

describe("ExcluirFichaClinica", () => {
  it("exige confirmação explícita", async () => {
    await cadastrarFicha();

    await expect(
      new ExcluirFichaClinica(fichas).executar(usuarioId, { confirmado: false as true }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(fichas.itens).toHaveLength(1);
  });

  it("remove a ficha e preserva a conta", async () => {
    await cadastrarFicha();

    await new ExcluirFichaClinica(fichas).executar(usuarioId, { confirmado: true });

    expect(fichas.itens).toHaveLength(0);
    expect(usuarios.itens).toHaveLength(1);
  });
});

describe("DefinirSenhaPublica e ObterDadosCartao", () => {
  it("troca a senha pública e só gera o cartão com a senha vigente", async () => {
    await cadastrarFicha();
    await new DefinirSenhaPublica(fichas, usuarios, hash).executar(usuarioId, { senhaPublica: "Z9Y8" });
    const cartao = new ObterDadosCartao(fichas, hash, URL_BASE);

    await expect(cartao.executar(usuarioId, { senhaPublica: "4821" })).rejects.toBeInstanceOf(
      ErroSenhaPublicaIncorreta,
    );
    const dados = await cartao.executar(usuarioId, { senhaPublica: "Z9Y8" });

    expect(dados.nomeTitular).toBe("Carlos Pereira");
    expect(dados.urlPublica).not.toContain("Z9Y8");
  });
});
