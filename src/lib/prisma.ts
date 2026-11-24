import { PrismaClient } from "@prisma/client";
import fs from "fs";

/**
 * DB接続の方式
 *
 * - CLOUD_SQL_INSTANCE と GCP_SA_KEY_BASE64 が設定されている場合:
 *   Cloud SQL Connector（サービスアカウント鍵で認証した暗号化トンネル）経由で接続する。
 *   この方式ではCloud SQLの「承認済みネットワーク」を開ける必要がない。
 * - 設定されていない場合（ローカル開発など）:
 *   従来通り DATABASE_URL に直接接続する。
 *
 * どちらの場合もユーザー名・パスワード・DB名は DATABASE_URL のものを使う。
 */
const CLOUD_SQL_INSTANCE = process.env.CLOUD_SQL_INSTANCE;
const GCP_SA_KEY_BASE64 = process.env.GCP_SA_KEY_BASE64;
const useConnector = Boolean(CLOUD_SQL_INSTANCE && GCP_SA_KEY_BASE64);

const SOCKET_PATH = "/tmp/cloudsql-mysql.sock";

// Connector経由のときは、DATABASE_URL の認証情報のまま接続先だけローカルのソケットに差し替える
function buildDatasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!useConnector || !raw) return raw;
  const url = new URL(raw);
  const user = url.username;
  const password = url.password;
  const dbName = url.pathname.replace(/^\//, "");
  return `mysql://${user}:${password}@localhost/${dbName}?socket=${encodeURIComponent(SOCKET_PATH)}`;
}

// ローカルのソケットでトンネルを待ち受ける。最初のクエリ時に1回だけ起動する
// （import時に起動するとビルド中にサーバーが立ち上がってしまうため遅延起動）
let proxyReady: Promise<void> | null = null;

function ensureProxy(): Promise<void> {
  if (!useConnector) return Promise.resolve();
  if (!proxyReady) {
    proxyReady = (async () => {
      const { Connector, IpAddressTypes } = await import(
        "@google-cloud/cloud-sql-connector"
      );
      const { JWT } = await import("google-auth-library");

      const credentials = JSON.parse(
        Buffer.from(GCP_SA_KEY_BASE64 as string, "base64").toString("utf8")
      );
      const connector = new Connector({
        auth: new JWT({
          email: credentials.client_email,
          key: credentials.private_key,
          scopes: ["https://www.googleapis.com/auth/sqlservice.admin"],
        }),
      });

      // 前回のインスタンスが残したソケットファイルがあると待ち受けに失敗するため削除
      try {
        fs.unlinkSync(SOCKET_PATH);
      } catch {
        // 存在しなければ何もしない
      }

      await connector.startLocalProxy({
        instanceConnectionName: CLOUD_SQL_INSTANCE as string,
        ipType: IpAddressTypes.PUBLIC,
        listenOptions: { path: SOCKET_PATH },
      });
      console.log("[DB] Cloud SQL Connector 経由で接続します");
    })().catch((error) => {
      // 次のリクエストで再試行できるようにする
      proxyReady = null;
      console.error("[DB] Cloud SQL Connector の起動に失敗しました:", error);
      throw error;
    });
  }
  return proxyReady;
}

function createPrismaClient() {
  const base = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: buildDatasourceUrl(),
      },
    },
  });

  if (!useConnector) return base;

  // すべてのクエリの前にトンネルの準備完了を待つ
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        await ensureProxy();
        return query(args);
      },
    },
  }) as unknown as PrismaClient;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;

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
          await ensureProxy();
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
