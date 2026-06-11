import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Prismaの接続エラー時に自動再接続してリトライするラッパー
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 500
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error?.message?.includes("Engine is not yet connected") ||
        error?.message?.includes("Connection refused") ||
        error?.message?.includes("Can't reach database server") ||
        error?.code === "P1001" ||
        error?.code === "P1002";

      if (isConnectionError && attempt < maxRetries) {
        console.warn(
          `[Prisma] 接続エラー (試行 ${attempt}/${maxRetries})、${delayMs}ms後に再接続します...`
        );
        // 切断して再接続
        try {
          await prisma.$disconnect();
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          await prisma.$connect();
        } catch (reconnectError) {
          console.error("[Prisma] 再接続エラー:", reconnectError);
        }
        continue;
      }

      throw error;
    }
  }
  throw new Error("リトライ上限に達しました");
}

export default prisma;
