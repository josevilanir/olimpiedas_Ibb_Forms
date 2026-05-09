import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "";
  // DB_POOL_SIZE controls max concurrent DB connections (set via Fly.io secrets)
  const max = parseInt(process.env.DB_POOL_SIZE ?? "20", 10);
  const adapter = new PrismaPg({ connectionString, max });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
