/**
 * npm run db:proxy で開いた中継（127.0.0.1:3307）経由で Prisma Studio を開く
 *
 * 使い方:
 *   ターミナル1: npm run db:proxy
 *   ターミナル2: npm run db:studio
 *
 * .env の DATABASE_URL のユーザー名・パスワード・DB名はそのままに、
 * 接続先だけを中継に差し替えて起動する（.env自体は書き換えない）。
 */
import { spawn } from "node:child_process";

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL を .env に設定してください");
  process.exit(1);
}

const port = Number(process.env.DB_PROXY_PORT || 3307);
const url = new URL(raw);
const proxied = `mysql://${url.username}:${url.password}@127.0.0.1:${port}${url.pathname}`;

const extraArgs = process.argv.slice(2);
const child = spawn("npx", ["prisma", "studio", ...extraArgs], {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: proxied },
});
child.on("exit", (code) => process.exit(code ?? 0));
