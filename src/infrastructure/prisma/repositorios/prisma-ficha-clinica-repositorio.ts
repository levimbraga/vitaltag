import type { Prisma, PrismaClient } from "@prisma/client";
import type {
  DadosFichaClinica,
  FichaClinica,
  FichaClinicaComTitular,
} from "@/domain/entidades/ficha-clinica";
import { ErroFichaJaExiste } from "@/domain/erros";
import type { FichaClinicaRepositorio } from "@/domain/repositorios/ficha-clinica-repositorio";
import { ehUuid, violouUnicidade } from "../utilitarios";

const relacoes = {
  contatosEmergencia: { orderBy: { prioridade: "asc" } },
  registrosClinicos: { orderBy: [{ tipo: "asc" }, { descricao: "asc" }] },
} satisfies Prisma.FichaClinicaInclude;

function separarDados(dados: DadosFichaClinica) {
  const { contatosEmergencia, registrosClinicos, ...campos } = dados;
  return {
    campos,
    contatos: contatosEmergencia.map((contato, indice) => ({ ...contato, prioridade: indice + 1 })),
    registros: registrosClinicos,
  };
}

export class PrismaFichaClinicaRepositorio implements FichaClinicaRepositorio {
  constructor(private readonly db: PrismaClient) {}

  async buscarPorUsuario(usuarioId: string): Promise<FichaClinica | null> {
    if (!ehUuid(usuarioId)) return null;
    return this.db.fichaClinica.findUnique({ where: { usuarioId }, include: relacoes });
  }

  async buscarPorSlug(slugPublico: string): Promise<FichaClinicaComTitular | null> {
    if (!ehUuid(slugPublico)) return null;

    const ficha = await this.db.fichaClinica.findUnique({
      where: { slugPublico },
      include: { ...relacoes, usuario: { select: { nome: true, email: true } } },
    });
    if (!ficha) return null;

    const { usuario, ...resto } = ficha;
    return { ...resto, titular: usuario };
  }

  async criar(
    usuarioId: string,
    dados: DadosFichaClinica,
    senhaPublicaHash: string,
  ): Promise<FichaClinica> {
    const { campos, contatos, registros } = separarDados(dados);
    try {
      return await this.db.fichaClinica.create({
        data: {
          ...campos,
          usuarioId,
          senhaPublicaHash,
          contatosEmergencia: { create: contatos },
          registrosClinicos: { create: registros },
        },
        include: relacoes,
      });
    } catch (erro) {
      if (violouUnicidade(erro)) throw new ErroFichaJaExiste();
      throw erro;
    }
  }

  // A escrita aninhada roda numa única transação: ou tudo é substituído, ou nada.
  atualizar(fichaId: string, dados: DadosFichaClinica): Promise<FichaClinica> {
    const { campos, contatos, registros } = separarDados(dados);
    return this.db.fichaClinica.update({
      where: { id: fichaId },
      data: {
        ...campos,
        contatosEmergencia: { deleteMany: {}, create: contatos },
        registrosClinicos: { deleteMany: {}, create: registros },
      },
      include: relacoes,
    });
  }

  async atualizarSenhaPublica(fichaId: string, senhaPublicaHash: string): Promise<void> {
    await this.db.fichaClinica.update({ where: { id: fichaId }, data: { senhaPublicaHash } });
  }

  async excluir(fichaId: string): Promise<void> {
    await this.db.fichaClinica.deleteMany({ where: { id: fichaId } });
  }
}
