import { randomUUID } from "node:crypto";
import type {
  AcessoPublico,
  NovoAcessoPublico,
  TentativaAcesso,
} from "@/domain/entidades/acesso-publico";
import type {
  DadosFichaClinica,
  FichaClinica,
  FichaClinicaComTitular,
} from "@/domain/entidades/ficha-clinica";
import type { NovoUsuario, Usuario } from "@/domain/entidades/usuario";
import { ErroEmailJaCadastrado, ErroFichaJaExiste } from "@/domain/erros";
import type {
  AcessoPublicoRepositorio,
  PaginaAcessos,
} from "@/domain/repositorios/acesso-publico-repositorio";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import type { UsuarioRepositorio } from "@/domain/repositorios/usuario-repositorio";
import type { Relogio } from "@/domain/servicos/relogio";
import type { MensagemEmail, ServicoEmail } from "@/domain/servicos/servico-email";
import type { ServicoHash } from "@/domain/servicos/servico-hash";
import type {
  DadosTokenRedefinicao,
  ServicoImpressaoSenha,
  ServicoTokenRedefinicao,
} from "@/domain/servicos/servico-token-redefinicao";

export const MINUTO = 60 * 1000;

export class RelogioControlado implements Relogio {
  constructor(private atual = new Date("2026-09-14T12:00:00Z")) {}

  agora(): Date {
    return new Date(this.atual);
  }

  avancar(ms: number): void {
    this.atual = new Date(this.atual.getTime() + ms);
  }
}

export class HashFalso implements ServicoHash {
  chamadasGerar = 0;

  async gerar(valor: string): Promise<string> {
    this.chamadasGerar++;
    return `hash:${valor}`;
  }

  async verificar(hash: string, valor: string): Promise<boolean> {
    return hash === `hash:${valor}`;
  }
}

export class ImpressaoFalsa implements ServicoImpressaoSenha {
  calcular(senhaHash: string): string {
    return `impressao:${senhaHash}`;
  }
}

export class TokenFalso implements ServicoTokenRedefinicao {
  emitir(dados: DadosTokenRedefinicao): string {
    return JSON.stringify({ ...dados, expiraEm: dados.expiraEm.toISOString() });
  }

  ler(token: string): DadosTokenRedefinicao | null {
    try {
      const dados = JSON.parse(token);
      return { ...dados, expiraEm: new Date(dados.expiraEm) };
    } catch {
      return null;
    }
  }
}

export class EmailFalso implements ServicoEmail {
  enviados: MensagemEmail[] = [];

  async enviar(mensagem: MensagemEmail): Promise<void> {
    this.enviados.push(mensagem);
  }
}

export class UsuariosEmMemoria implements UsuarioRepositorio {
  itens: Usuario[] = [];

  async buscarPorId(id: string) {
    return this.itens.find((usuario) => usuario.id === id) ?? null;
  }

  async buscarPorEmail(email: string) {
    return this.itens.find((usuario) => usuario.email === email) ?? null;
  }

  async criar(dados: NovoUsuario) {
    if (this.itens.some((usuario) => usuario.email === dados.email)) {
      throw new ErroEmailJaCadastrado();
    }
    const agora = new Date();
    const usuario: Usuario = {
      ...dados,
      id: randomUUID(),
      emailVerificado: false,
      criadoEm: agora,
      atualizadoEm: agora,
    };
    this.itens.push(usuario);
    return usuario;
  }

  async atualizarSenha(id: string, senhaHash: string) {
    const usuario = this.itens.find((item) => item.id === id);
    if (usuario) usuario.senhaHash = senhaHash;
  }
}

export class FichasEmMemoria implements FichaClinicaRepositorio {
  itens: FichaClinica[] = [];

  constructor(private readonly usuarios: UsuariosEmMemoria) {}

  async buscarPorUsuario(usuarioId: string) {
    return this.itens.find((ficha) => ficha.usuarioId === usuarioId) ?? null;
  }

  async buscarPorSlug(slug: string): Promise<FichaClinicaComTitular | null> {
    const ficha = this.itens.find((item) => item.slugPublico === slug);
    if (!ficha) return null;
    const usuario = await this.usuarios.buscarPorId(ficha.usuarioId);
    return { ...ficha, titular: { nome: usuario!.nome, email: usuario!.email } };
  }

  async criar(usuarioId: string, dados: DadosFichaClinica, senhaPublicaHash: string) {
    if (this.itens.some((ficha) => ficha.usuarioId === usuarioId)) throw new ErroFichaJaExiste();
    const id = randomUUID();
    const agora = new Date();
    const ficha: FichaClinica = {
      id,
      usuarioId,
      slugPublico: randomUUID(),
      senhaPublicaHash,
      ativa: true,
      criadaEm: agora,
      atualizadaEm: agora,
      ...this.materializar(id, dados),
    };
    this.itens.push(ficha);
    return ficha;
  }

  async atualizar(fichaId: string, dados: DadosFichaClinica) {
    const ficha = this.itens.find((item) => item.id === fichaId)!;
    Object.assign(ficha, this.materializar(fichaId, dados), { atualizadaEm: new Date() });
    return ficha;
  }

  async atualizarSenhaPublica(fichaId: string, senhaPublicaHash: string) {
    const ficha = this.itens.find((item) => item.id === fichaId);
    if (ficha) ficha.senhaPublicaHash = senhaPublicaHash;
  }

  async excluir(fichaId: string) {
    this.itens = this.itens.filter((ficha) => ficha.id !== fichaId);
  }

  private materializar(fichaId: string, dados: DadosFichaClinica) {
    return {
      nome: dados.nome,
      sobrenome: dados.sobrenome,
      sexo: dados.sexo,
      tipoSanguineo: dados.tipoSanguineo,
      contatosEmergencia: dados.contatosEmergencia.map((contato, indice) => ({
        ...contato,
        id: randomUUID(),
        fichaId,
        prioridade: indice + 1,
      })),
      registrosClinicos: dados.registrosClinicos.map((registro) => ({
        ...registro,
        id: randomUUID(),
        fichaId,
        criadoEm: new Date(),
      })),
    };
  }
}

export class AcessosEmMemoria implements AcessoPublicoRepositorio {
  itens: AcessoPublico[] = [];

  async registrar(acesso: NovoAcessoPublico) {
    this.itens.push({ ...acesso, id: randomUUID() });
  }

  async listarTentativasDesde(fichaId: string, desde: Date): Promise<TentativaAcesso[]> {
    return this.itens
      .filter((item) => item.fichaId === fichaId && item.ocorridoEm >= desde)
      .map(({ sucesso, ocorridoEm }) => ({ sucesso, ocorridoEm }));
  }

  async listarPaginado(fichaId: string, pagina: number, porPagina: number): Promise<PaginaAcessos> {
    const daFicha = this.itens
      .filter((item) => item.fichaId === fichaId)
      .sort((a, b) => b.ocorridoEm.getTime() - a.ocorridoEm.getTime());
    return {
      itens: daFicha.slice((pagina - 1) * porPagina, pagina * porPagina),
      total: daFicha.length,
    };
  }

  async removerAnterioresA(data: Date) {
    const antes = this.itens.length;
    this.itens = this.itens.filter((item) => item.ocorridoEm >= data);
    return antes - this.itens.length;
  }
}
