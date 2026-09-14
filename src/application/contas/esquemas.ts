import { z } from "zod";
import { SENHA_CONTA_MAX, SENHA_CONTA_MIN } from "@/domain/regras/politicas";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Informe o e-mail.")
  .max(180, "O e-mail deve ter no máximo 180 caracteres.")
  .pipe(z.email("Informe um e-mail válido."));

export const senhaContaSchema = z
  .string()
  .min(SENHA_CONTA_MIN, `A senha deve ter no mínimo ${SENHA_CONTA_MIN} caracteres.`)
  .max(SENHA_CONTA_MAX, `A senha deve ter no máximo ${SENHA_CONTA_MAX} caracteres.`)
  .regex(/\p{L}/u, "A senha deve conter ao menos uma letra.")
  .regex(/\d/, "A senha deve conter ao menos um número.");

export const cadastroUsuarioSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, "Informe o nome.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
  email: emailSchema,
  senha: senhaContaSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, "Informe a senha.").max(SENHA_CONTA_MAX),
});

export const solicitarRedefinicaoSchema = z.object({
  email: emailSchema,
});

export const redefinirSenhaSchema = z
  .object({
    token: z.string().min(1, "Link de redefinição ausente."),
    senha: senhaContaSchema,
    confirmacao: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmacao, {
    error: "As senhas não conferem.",
    path: ["confirmacao"],
  });

export type CadastroUsuarioEntrada = z.input<typeof cadastroUsuarioSchema>;
export type LoginEntrada = z.input<typeof loginSchema>;
export type SolicitarRedefinicaoEntrada = z.input<typeof solicitarRedefinicaoSchema>;
export type RedefinirSenhaEntrada = z.input<typeof redefinirSenhaSchema>;
