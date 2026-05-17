import { PrismaClient } from "@prisma/client";

// Next.js dev mode hot-reloads, which can create many Prisma instances
// and exhaust the Postgres connection pool. We attach to globalThis in dev
// so hot reload reuses the same client.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
