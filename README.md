# トラブルまるごとレスキュー隊

生活上のトラブルに対して、AIが初期対応を行い、適切なアドバイスを提供するWebアプリケーションです。

## 📋 目次

- [概要](#概要)
- [主要機能](#主要機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [環境変数](#環境変数)
- [開発](#開発)
- [デプロイ](#デプロイ)
- [ライセンス](#ライセンス)

---

## 概要

### サービス名
**トラブルまるごとレスキュー隊**

### 目的
生活上のトラブル（近隣トラブル、住居トラブル、防犯トラブルなど）に対して、AIチャットボットが24時間365日対応します。深刻なケースや複雑なケースは、電話サポートへエスカレーションします。

### 対応するトラブル
- 近隣トラブル（騒音、ゴミ出し、駐車場など）
- 住居トラブル（設備の不具合、水漏れ、異音など）
- 防犯トラブル（不審者、盗難、迷惑行為など）
- その他生活上のトラブル全般

---

## 主要機能

### 1. 認証・ユーザー管理
- ログイン機能（メールアドレス・パスワード認証）
- 新規登録機能（認証キーによる登録制限）
- パスワード再設定機能

### 2. AI相談チャット機能
- AI（GPT-4.1-nano）とのリアルタイムチャット
- 自動タイトル生成
- ストリーミングレスポンス
- 相談履歴の保存・継続
- ステータス管理（相談中/解決済み/電話相談）

### 3. 相談履歴管理
- 相談履歴一覧表示
- ステータスフィルター機能
- ページネーション（15件/ページ）
- 30秒ごとの自動更新

### 4. マイページ
- ユーザー情報表示
- 相談統計（総件数/解決済み/相談中/電話相談）
- パスワード変更機能

### 5. 管理者機能
- ユーザー管理（一覧、検索、権限管理、削除）
- 認証キー管理（生成、ステータス管理、CSV一括生成）
- CSVインポート機能（契約情報の一括登録・更新）

### 6. 静的ページ
- 運営者情報
- プライバシーポリシー

---

## 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks**

### バックエンド
- **Next.js API Routes**
- **NextAuth.js** (認証)
- **Prisma** (ORM)
- **bcrypt** (パスワードハッシュ化)

### データベース
- **MySQL 8.0** (AWS Lightsail Database)

### AI
- **OpenAI GPT-4.1-nano** (gpt-4.1-nano-2025-04-14)

### デプロイ
- **Vercel** (フロントエンド・API)
- **AWS Lightsail Database** (データベース)

---

## セットアップ

### 前提条件
- Node.js 18.x 以上
- npm または yarn
- MySQL 8.0 以上

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-org/trouble.git
cd trouble

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .env ファイルを編集して、必要な環境変数を設定

# データベースをマイグレーション
npx prisma migrate dev

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

---

## 環境変数

`.env` ファイルに以下の環境変数を設定してください：

```bash
# データベース
DATABASE_URL="mysql://user:password@host:3306/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI
OPENAI_API_KEY="sk-..."
```

### 環境変数の説明

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `DATABASE_URL` | MySQL接続文字列 | ✅ |
| `NEXTAUTH_URL` | アプリケーションのURL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth秘密鍵（32文字以上推奨） | ✅ |
| `OPENAI_API_KEY` | OpenAI APIキー | ✅ |

---

## 開発

### ディレクトリ構造

```
trouble/
├── prisma/
│   └── schema.prisma          # データベーススキーマ
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # APIルート
│   │   ├── admin/            # 管理画面
│   │   ├── auth/             # 認証ページ
│   │   ├── consultation/     # 相談チャット
│   │   ├── history/          # 相談履歴
│   │   └── mypage/           # マイページ
│   ├── components/           # Reactコンポーネント
│   ├── lib/                  # ユーティリティ
│   └── types/                # TypeScript型定義
├── public/                   # 静的ファイル
└── README.md
```

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番環境で起動
npm start

# Prismaスタジオ（DBビューア）
npx prisma studio

# データベースマイグレーション
npx prisma migrate dev

# 型生成
npx prisma generate
```

### ブランチ戦略

- `main`: 本番環境用
- `develop`: 開発環境用
- `feature/*`: 新機能開発用
- `feature/frontend-development`: フロントエンド開発用

---

## デプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定
4. デプロイ

```bash
# Vercel CLIでデプロイ
npx vercel
```

### 環境変数の設定（Vercel）

Vercelダッシュボードで以下の環境変数を設定してください：
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `OPENAI_API_KEY`

---

## データベース

### スキーマ

- **User**: ユーザー情報
- **Token**: 認証キー
- **ChatRoom**: 相談ルーム
- **ChatMessage**: チャットメッセージ

詳細は `prisma/schema.prisma` を参照してください。

---

## セキュリティ

- NextAuth.jsによるセッション管理
- JWTトークンベース認証（30日間有効）
- bcryptによるパスワードハッシュ化
- Prismaによる安全なクエリ実行
- ミドルウェアによるルート保護

---

## パフォーマンス

- Next.js App Routerによる自動最適化
- ストリーミングレスポンス（チャット）
- ページネーション（相談履歴: 15件/ページ）
- データベースインデックス最適化
- 自動更新の最適化（30秒間隔）

---

## サポート

### 問い合わせ

- **運営会社**: 株式会社メディアサービス
- **住所**: 〒170-0013 東京都豊島区東池袋1-25-8 タカセビル3F
- **電話**: 0120-542-179（24時間365日対応）
- **お問い合わせフォーム**: https://troublesolution-lab.com/

---

## ライセンス

このプロジェクトは非公開です。無断転載・複製を禁じます。

---

**最終更新日**: 2026年2月19日
