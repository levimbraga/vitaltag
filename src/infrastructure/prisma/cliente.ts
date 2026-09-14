import { PrismaClient } from "@prisma/client";

// Reaproveito a mesma instância entre recarregamentos do servidor de desenvolvimento
// para não esgotar as conexões do pooler.
const globalComPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalComPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalComPrisma.prisma = prisma;
}
