import { z } from "zod";

export const slugPublicoSchema = z.uuid();

export const tentativaAcessoSchema = z.object({
  slug: z.string(),
  senha: z.string().max(64),
  // A coluna ip_origem é do tipo inet; um valor inválido não pode derrubar o acesso.
  ipOrigem: z.union([z.ipv4(), z.ipv6()]).catch("0.0.0.0"),
  userAgent: z
    .string()
    .nullish()
    .transform((valor) => (valor ? valor.slice(0, 255) : null)),
});

export const historicoAcessosSchema = z.object({
  pagina: z.coerce.number().int().min(1).catch(1),
});

export type TentativaAcessoEntrada = z.input<typeof tentativaAcessoSchema>;
// A página vem da query string e pode faltar; o esquema cai para 1 nesse caso.
export type HistoricoAcessosEntrada = { pagina?: unknown };
