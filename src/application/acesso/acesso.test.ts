import { beforeEach, describe, expect, it } from "vitest";
import type { FichaClinica } from "@/domain/entidades/ficha-clinica";
import {
  AcessosEmMemoria,
  EmailFalso,
  FichasEmMemoria,
  HashFalso,
  MINUTO,
  RelogioControlado,
  UsuariosEmMemoria,
} from "@/application/_testes/dubles";
import { AcessarFichaPublica } from "./acessar-ficha-publica";
import { ConsultarSituacaoFichaPublica } from "./consultar-situacao-ficha-publica";
import { ListarHistoricoAcessos } from "./listar-historico-acessos";

let usuarios: UsuariosEmMemoria;
let fichas: FichasEmMemoria;
let acessos: AcessosEmMemoria;
let email: EmailFalso;
let relogio: RelogioControlado;
let ficha: FichaClinica;

beforeEach(async () => {
  usuarios = new UsuariosEmMemoria();
  fichas = new FichasEmMemoria(usuarios);
  acessos = new AcessosEmMemoria();
  email = new EmailFalso();
  relogio = new RelogioControlado();

  const usuario = await usuarios.criar({ nome: "Carlos", email: "carlos@exemplo.com", senhaHash: "hash:conta1234" });
  ficha = await fichas.criar(
    usuario.id,
    {
      nome: "Carlos",
      sobrenome: "Pereira",
      sexo: "MASCULINO",
      tipoSanguineo: "O_NEG",
      contatosEmergencia: [{ nome: "Marta", telefone: "51999990000", parentesco: "Esposa" }],
      registrosClinicos: [{ tipo: "ALERGIA", descricao: "Dipirona", observacao: null }],
    },
    "hash:4821",
  );
});

const tentar = (senha: string, slug = ficha.slugPublico) =>
  new AcessarFichaPublica(fichas, acessos, new HashFalso(), email, relogio).executar({
    slug,
    senha,
    ipOrigem: "203.0.113.7",
    userAgent: "Navegador de teste",
  });

async function errarVezes(quantidade: number) {
  for (let i = 0; i < quantidade; i++) {
    await tentar("0000");
    relogio.avancar(MINUTO);
  }
}

describe("AcessarFichaPublica", () => {
  it("libera a ficha com a senha correta e registra o sucesso", async () => {
    const resultado = await tentar("4821");

    expect(resultado.status).toBe("liberada");
    if (resultado.status === "liberada") {
      expect(resultado.ficha.tipoSanguineo).toBe("O_NEG");
      expect(resultado.ficha.alergias).toEqual([{ descricao: "Dipirona", observacao: null }]);
      expect(resultado.ficha).not.toHaveProperty("senhaPublicaHash");
    }
    expect(acessos.itens).toMatchObject([{ sucesso: true, ipOrigem: "203.0.113.7" }]);
  });

  it("com senha errada não devolve dados da ficha", async () => {
    expect(await tentar("0000")).toEqual({ status: "senha_incorreta" });
  });

  it("trata slug inexistente ou malformado como indisponível", async () => {
    expect(await tentar("4821", crypto.randomUUID())).toEqual({ status: "indisponivel" });
    expect(await tentar("4821", "nao-e-uuid")).toEqual({ status: "indisponivel" });
  });

  it("bloqueia na quinta falha e avisa o titular uma única vez", async () => {
    await errarVezes(4);
    const resultado = await tentar("0000");

    expect(resultado.status).toBe("bloqueada");
    expect(email.enviados).toHaveLength(1);
    expect(email.enviados[0].para).toBe("carlos@exemplo.com");
  });

  it("durante o bloqueio não verifica a senha nem grava a tentativa", async () => {
    await errarVezes(5);
    const gravadas = acessos.itens.length;

    expect((await tentar("4821")).status).toBe("bloqueada");
    expect(acessos.itens).toHaveLength(gravadas);
  });

  it("libera quando a quinta falha sai da janela e não repete o aviso ao bloquear de novo", async () => {
    // Falhas de t0 a t4; o relógio está em t5. Em t15 a falha de t0 sai da janela.
    await errarVezes(5);
    relogio.avancar(10 * MINUTO);

    const situacao = await new ConsultarSituacaoFichaPublica(fichas, acessos, relogio).executar(ficha.slugPublico);
    expect(situacao).toEqual({ status: "disponivel" });

    expect((await tentar("0000")).status).toBe("bloqueada");
    expect(email.enviados).toHaveLength(1);
  });

  it("reinicia a contagem após um acesso bem-sucedido", async () => {
    await errarVezes(4);
    await tentar("4821");

    expect(await tentar("0000")).toEqual({ status: "senha_incorreta" });
  });

  it("descarta registros com mais de 90 dias ao gravar um novo acesso", async () => {
    await acessos.registrar({
      fichaId: ficha.id,
      ipOrigem: "203.0.113.7",
      userAgent: null,
      sucesso: true,
      ocorridoEm: new Date(relogio.agora().getTime() - 91 * 24 * 60 * MINUTO),
    });

    await tentar("4821");

    expect(acessos.itens).toHaveLength(1);
  });
});

describe("ListarHistoricoAcessos", () => {
  it("lista do mais recente para o mais antigo, 20 por página", async () => {
    for (let i = 0; i < 25; i++) {
      await acessos.registrar({
        fichaId: ficha.id,
        ipOrigem: "203.0.113.7",
        userAgent: null,
        sucesso: i % 2 === 0,
        ocorridoEm: new Date(relogio.agora().getTime() + i * MINUTO),
      });
    }
    const listar = new ListarHistoricoAcessos(fichas, acessos);

    const primeira = await listar.executar(ficha.usuarioId, { pagina: "1" });
    const segunda = await listar.executar(ficha.usuarioId, { pagina: 2 });

    expect(primeira).toMatchObject({ pagina: 1, totalPaginas: 2, total: 25 });
    expect(primeira.itens).toHaveLength(20);
    expect(primeira.itens[0].ocorridoEm.getTime()).toBeGreaterThan(primeira.itens[1].ocorridoEm.getTime());
    expect(segunda.itens).toHaveLength(5);
  });

  it("não mostra nada a quem não é o titular", async () => {
    const resultado = await new ListarHistoricoAcessos(fichas, acessos).executar(crypto.randomUUID(), {});

    expect(resultado).toEqual({ itens: [], pagina: 1, totalPaginas: 1, total: 0 });
  });
});
