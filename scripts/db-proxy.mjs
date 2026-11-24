/**
 * 手元のPCから本番DB（Cloud SQL）に接続するための中継
 *
 * Cloud SQLは承認済みネットワークを閉じているため、直接は接続できない。
 * このスクリプトを起動している間だけ、127.0.0.1:3307 に
 * Cloud SQL Connector（サービスアカウント鍵で認証した暗号化トンネル）の入口を開く。
 *
 * 使い方: npm run db:proxy   （Ctrl+C で終了）
 * 必要な設定値（.env）: CLOUD_SQL_INSTANCE, GCP_SA_KEY_BASE64
 */
import { Connector, IpAddressTypes } from "@google-cloud/cloud-sql-connector";
import { JWT } from "google-auth-library";
import net from "node:net";

const PROXY_HOST = "127.0.0.1";
const PROXY_PORT = Number(process.env.DB_PROXY_PORT || 3307);

const instance = process.env.CLOUD_SQL_INSTANCE;
const keyBase64 = process.env.GCP_SA_KEY_BASE64;

if (!instance || !keyBase64) {
  console.error(
    "CLOUD_SQL_INSTANCE と GCP_SA_KEY_BASE64 を .env に設定してください"
  );
  process.exit(1);
}

const credentials = JSON.parse(
  Buffer.from(keyBase64, "base64").toString("utf8")
);

const connector = new Connector({
  auth: new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ["https://www.googleapis.com/auth/sqlservice.admin"],
  }),
});

// 接続ごとに Connector の暗号化トンネルを張り、手元のTCP接続とつなぐ
const { stream } = await connector.getOptions({
  instanceConnectionName: instance,
  ipType: IpAddressTypes.PUBLIC,
});

const server = net.createServer((client) => {
  const upstream = stream();
  client.pipe(upstream).pipe(client);
  const closeBoth = () => {
    client.destroy();
    upstream.destroy();
  };
  client.on("error", closeBoth);
  upstream.on("error", (error) => {
    console.error("トンネルでエラーが発生しました:", error.message);
    closeBoth();
  });
});

// 手元のPC以外からは接続できないよう 127.0.0.1 のみで待ち受ける
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(PROXY_PORT, PROXY_HOST, resolve);
});

console.log(
  `本番DBへの中継を ${PROXY_HOST}:${PROXY_PORT} で開きました（Ctrl+C で終了）`
);

const shutdown = () => {
  server.close();
  connector.close();
  console.log("\n中継を終了しました");
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
