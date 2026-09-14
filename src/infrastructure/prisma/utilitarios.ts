import { Prisma } from "@prisma/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Colunas uuid recusam texto arbitrário com erro do banco; filtro antes da consulta.
export function ehUuid(valor: string): boolean {
  return UUID.test(valor);
}

export function violouUnicidade(erro: unknown): boolean {
  return erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002";
}
