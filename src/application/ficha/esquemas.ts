import { z } from "zod";
import {
  MAX_CONTATOS_EMERGENCIA,
  MAX_ITENS_POR_REGISTRO,
  SENHA_PUBLICA_MAX,
  SENHA_PUBLICA_MIN,
} from "@/domain/regras/politicas";
import { SEXOS, TIPOS_SANGUINEOS } from "@/domain/tipos";

function textoObrigatorio(mensagemVazio: string, maximo: number) {
  return z
    .string()
    .trim()
    .min(1, mensagemVazio)
    .max(maximo, `Use no máximo ${maximo} caracteres.`);
}

export const itemRegistroSchema = z.object({
  descricao: textoObrigatorio("Descreva o item.", 200),
  observacao: z.string().trim().max(1000, "Use no máximo 1000 caracteres.").nullish(),
});

const listaDeRegistros = z
  .array(itemRegistroSchema)
  .max(MAX_ITENS_POR_REGISTRO, `Adicione no máximo ${MAX_ITENS_POR_REGISTRO} itens.`)
  .default([]);

export const contatoEmergenciaSchema = z.object({
  nome: textoObrigatorio("Informe o nome do contato.", 120),
  telefone: z
    .string()
    .trim()
    .min(1, "Informe o telefone do contato.")
    .regex(/^[\d\s()+-]{8,20}$/, "Informe um telefone válido."),
  parentesco: textoObrigatorio("Informe o parentesco.", 60),
});

export const dadosFichaSchema = z.object({
  nome: textoObrigatorio("Informe o nome.", 80),
  sobrenome: textoObrigatorio("Informe o sobrenome.", 120),
  sexo: z.enum(SEXOS, { error: "Selecione uma opção válida." }).default("NAO_INFORMADO"),
  tipoSanguineo: z.enum(TIPOS_SANGUINEOS, { error: "Selecione o tipo sanguíneo." }),
  contatosEmergencia: z
    .array(contatoEmergenciaSchema)
    .min(1, "Informe ao menos um contato de emergência.")
    .max(MAX_CONTATOS_EMERGENCIA, `Informe no máximo ${MAX_CONTATOS_EMERGENCIA} contatos.`),
  alergias: listaDeRegistros,
  medicamentos: listaDeRegistros,
  doencas: listaDeRegistros,
  cirurgias: listaDeRegistros,
});

export const senhaPublicaSchema = z
  .string()
  .regex(
    new RegExp(`^[A-Za-z0-9]{${SENHA_PUBLICA_MIN},${SENHA_PUBLICA_MAX}}$`),
    `A senha de acesso deve ter de ${SENHA_PUBLICA_MIN} a ${SENHA_PUBLICA_MAX} letras ou números.`,
  );

export const cadastroFichaSchema = dadosFichaSchema.extend({
  senhaPublica: senhaPublicaSchema,
});

export const definirSenhaPublicaSchema = z.object({
  senhaPublica: senhaPublicaSchema,
});

export const excluirFichaSchema = z.object({
  confirmado: z.literal(true, { error: "Confirme a exclusão da ficha." }),
});

export type DadosFichaEntrada = z.input<typeof dadosFichaSchema>;
export type DadosFichaValidados = z.output<typeof dadosFichaSchema>;
export type CadastroFichaEntrada = z.input<typeof cadastroFichaSchema>;
export type DefinirSenhaPublicaEntrada = z.input<typeof definirSenhaPublicaSchema>;
export type ExcluirFichaEntrada = z.input<typeof excluirFichaSchema>;
