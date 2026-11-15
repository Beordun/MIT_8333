import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma_v2: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!raw) return undefined;
  return raw
    .replace("?channel_binding=require&", "?")
    .replace("&channel_binding=require", "");
}

const resolvedUrl = resolveDatabaseUrl();

/** Singleton PrismaClient to prevent connection exhaustion in serverless/dev environments. */
export const prisma =
  globalForPrisma.prisma_v2 ??
  new PrismaClient({
    ...(resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma_v2 = prisma;
}
