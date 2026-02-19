# 開発ガイド

このドキュメントは、トラブルまるごとレスキュー隊の開発に関する技術仕様とガイドラインをまとめたものです。

## 📋 目次

- [アーキテクチャ](#アーキテクチャ)
- [データベース設計](#データベース設計)
- [API仕様](#api仕様)
- [AI設計](#ai設計)
- [フロントエンド](#フロントエンド)
- [認証・セキュリティ](#認証セキュリティ)
- [パフォーマンス最適化](#パフォーマンス最適化)
- [テスト](#テスト)

---

## アーキテクチャ

### システム構成

```
┌─────────────┐
│   ユーザー   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────┐
│   Next.js (Vercel)              │
│  ┌──────────────────────────┐  │
│  │  App Router (Pages)      │  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │  API Routes              │  │
│  │  - /api/auth             │  │
│  │  - /api/chat             │  │
│  │  - /api/users            │  │
│  │  - /api/tokens           │  │
│  │  - /api/admin            │  │
│  └──────────────────────────┘  │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│   MySQL (AWS Lightsail)         │
│  - User                         │
│  - Token                        │
│  - ChatRoom                     │
│  - ChatMessage                  │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│   OpenAI API                    │
│  - GPT-4.1-nano                 │
└─────────────────────────────────┘
```

### 技術スタック詳細

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js | 15.x |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 3.x |
| 認証 | NextAuth.js | 4.x |
| ORM | Prisma | 6.x |
| データベース | MySQL | 8.0 |
| AI | OpenAI GPT-4.1-nano | 2025-04-14 |

---

## データベース設計

### スキーマ定義

#### User テーブル

```prisma
model User {
  id            Int          @id @default(autoincrement())
  email         String       @unique
  password      String
  last_name     String?
  first_name    String?
  phone_number  String?
  token_id      Int?         @unique
  token         Token?       @relation(fields: [token_id], references: [id])
  is_admin      Boolean      @default(false)
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt
  chat_rooms    ChatRoom[]
}
```

#### Token テーブル

```prisma
model Token {
  id           Int          @id @default(autoincrement())
  token_value  String       @unique
  status       TokenStatus  @default(UNUSED)
  user         User?
  created_at   DateTime     @default(now())
  updated_at   DateTime     @updatedAt
}

enum TokenStatus {
  UNUSED   // 未使用
  ACTIVE   // 使用中
  REVOKED  // 無効
}
```

#### ChatRoom テーブル

```prisma
model ChatRoom {
  id            Int          @id @default(autoincrement())
  user_id       Int
  user          User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  title         String?
  last_message  String?      @db.Text
  status        RoomStatus   @default(IN_PROGRESS)
  created_at    DateTime     @default(now())
  updated_at    DateTime     @updatedAt
  messages      ChatMessage[]
}

enum RoomStatus {
  IN_PROGRESS  // 相談中
  RESOLVED     // 解決済み
  ESCALATED    // 電話相談
}
```

#### ChatMessage テーブル

```prisma
model ChatMessage {
  id            Int       @id @default(autoincrement())
  chat_room_id  Int
  chat_room     ChatRoom  @relation(fields: [chat_room_id], references: [id], onDelete: Cascade)
  role          String    // "user" or "assistant"
  content       String    @db.Text
  created_at    DateTime  @default(now())
}
```

### インデックス設計

```prisma
// User
@@index([email])
@@index([token_id])

// Token
@@index([token_value])
@@index([status])

// ChatRoom
@@index([user_id])
@@index([status])
@@index([created_at])
@@index([user_id, status])

// ChatMessage
@@index([chat_room_id])
@@index([created_at])
@@index([chat_room_id, created_at])
```

### データ容量予測

| ユーザー数 | 月間増加量 | 年間増加量 | 3年間累計 |
|-----------|-----------|-----------|----------|
| 100人 | 8-11 MB | 100-130 MB | 300-400 MB |
| 500人 | 41-55 MB | 500-660 MB | 1.5-2.0 GB |
| 1,000人 | 83-110 MB | 1.0-1.3 GB | 3.0-4.0 GB |
| 5,000人 | 413-550 MB | 5.0-6.6 GB | 15.0-20.0 GB |

---

## API仕様

### 認証関連

#### POST /api/auth/[...nextauth]
NextAuth認証エンドポイント

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "is_admin": false
  },
  "expires": "2026-03-21T00:00:00.000Z"
}
```

#### POST /api/auth/reset-password
パスワードリセット

**リクエスト:**
```json
{
  "authKey": "uuid-string",
  "email": "user@example.com",
  "newPassword": "newpassword123"
}
```

### ユーザー関連

#### GET /api/users/me
現在のユーザー情報取得

**レスポンス:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "is_admin": false,
  "token": {
    "token_value": "uuid-string",
    "status": "ACTIVE"
  }
}
```

#### POST /api/users
ユーザー登録

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "authKey": "uuid-string"
}
```

### チャット関連

#### POST /api/chat
メッセージ送信・AI応答

**リクエスト:**
```json
{
  "message": "隣の騒音がひどくて困っています",
  "chatRoomId": 123
}
```

**レスポンス:** (ストリーミング)
```
data: {"content":"それは大変ですね。"}
data: {"content":"もう少し詳しく"}
data: {"content":"教えていただけますか？"}
data: [DONE]
```

#### GET /api/chat/rooms
チャットルーム一覧取得

**クエリパラメータ:**
- `page`: ページ番号（デフォルト: 1）
- `limit`: 件数（デフォルト: 15）
- `status`: フィルター（IN_PROGRESS/RESOLVED/ESCALATED）

**レスポンス:**
```json
{
  "rooms": [
    {
      "id": 123,
      "title": "騒音トラブル",
      "status": "IN_PROGRESS",
      "last_message": "ありがとうございます",
      "created_at": "2026-02-19T10:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 4
}
```

### 管理者関連

#### POST /api/admin/import-csv
CSVインポート（プレビュー）

**リクエスト:** (FormData)
```
file: CSV file
```

**レスポンス:**
```json
{
  "success": true,
  "stats": {
    "total": 100,
    "filtered": 80,
    "skipped": 20
  },
  "extractedData": [...]
}
```

#### POST /api/admin/import-csv/confirm
CSVインポート（確定）

**リクエスト:**
```json
{
  "records": [
    {
      "authKey": "uuid-string",
      "phoneNumber": "09012345678",
      "status": "ACTIVE"
    }
  ]
}
```

**レスポンス:**
```json
{
  "success": true,
  "results": {
    "total": 80,
    "success": 75,
    "failed": 5,
    "created": 50,
    "updated": 25,
    "skipped": 5,
    "phoneUpdated": 30,
    "errors": [...]
  }
}
```

---

## AI設計

### システムプロンプト

AIは以下の方針で応答します：

1. **対応するトラブル**
   - 近隣トラブル（騒音、ゴミ出し、駐車場など）
   - 住居トラブル（設備の不具合、水漏れ、異音など）
   - 防犯トラブル（不審者、盗難、迷惑行為など）

2. **応答の基本方針**
   - 傾聴と共感を示す
   - 状況を5W1Hで把握する
   - 段階的な解決策を提案する
   - 記録の重要性を伝える

3. **電話サポートへの案内**
   
   以下の2つの場合のみ電話番号を案内：
   
   ✅ **ユーザーからの明確な要望がある場合**
   - 「電話で相談したい」
   - 「電話で話したい」
   - 「直接話したい」
   
   ✅ **緊急度が極めて高い場合**
   - 今すぐ身体的危険がある（暴力、傷害など）
   - 重大な犯罪の可能性がある（ストーカー、侵入、脅迫など）
   - 生命や健康に直接的な危険がある（ガス漏れ、火災の危険など）
   
   **上記以外のケースでは、チャットで丁寧に対応します。**

### 電話案内の文言

#### ユーザーからの要望があった場合
```
お電話でのご相談も承っております。

📞 トラブル相談ホットライン
電話番号：0120-542-179
受付時間：24時間365日対応

チャットでも引き続きサポートいたしますので、お気軽にご相談ください。
```

#### 緊急度が極めて高い場合
```
この状況は緊急性が高いため、お電話でのご相談をお勧めします。
専門スタッフが詳しくお話を伺い、適切な対応をご案内いたします。

📞 トラブル相談ホットライン
電話番号：0120-542-179
受付時間：24時間365日対応

また、身の危険を感じる場合は、すぐに110番へ通報してください。
```

### AIモデル設定

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4.1-nano-2025-04-14",
  messages: messages,
  temperature: 0.3,
  max_tokens: 1000,
  stream: true,
});
```

### コスト

- **入力**: $0.15 / 1M tokens
- **出力**: $0.60 / 1M tokens
- **平均1往復**: 約¥0.3-0.5

---

## フロントエンド

### ディレクトリ構造

```
src/
├── app/                      # Next.js App Router
│   ├── api/                 # APIルート
│   ├── admin/               # 管理画面
│   │   ├── components/     # 管理画面専用コンポーネント
│   │   │   ├── CsvImport.tsx
│   │   │   ├── TokenManagement.tsx
│   │   │   └── UserList.tsx
│   │   └── page.tsx
│   ├── auth/                # 認証ページ
│   ├── consultation/        # 相談チャット
│   │   ├── [id]/           # 既存相談
│   │   └── new/            # 新規相談
│   ├── history/             # 相談履歴
│   ├── mypage/              # マイページ
│   ├── register/            # 新規登録
│   ├── company/             # 会社概要
│   ├── privacy/             # プライバシーポリシー
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # トップページ
│   └── globals.css          # グローバルスタイル
├── components/              # 共通コンポーネント
│   ├── AuthenticatedLayout.tsx
│   ├── MenuHeader.tsx
│   ├── NewTroubleChat.tsx
│   ├── TroubleChat.tsx
│   └── FullScreenLoading.tsx
├── lib/                     # ユーティリティ
│   ├── auth.ts             # NextAuth設定
│   └── prisma.ts           # Prismaクライアント
└── types/                   # 型定義
    ├── chat.ts
    ├── index.ts
    └── next-auth.d.ts
```

### UI/UXデザイン

#### カラースキーム

```css
/* プライマリカラー */
--primary: #1888CF;      /* 青 */
--accent: #FF7BAC;       /* ピンク */

/* 背景グラデーション */
--bg-gradient: linear-gradient(135deg, #ACE0F9 0%, #64B3F4 100%);

/* カード背景 */
--card-bg: #FDFDFD;      /* 白 */

/* ステータス色 */
--status-in-progress: #FFF9C4;  /* 黄 */
--status-resolved: #E3F2FD;     /* 青 */
--status-escalated: #FFE4F1;    /* ピンク */
```

#### レスポンシブデザイン

```css
/* モバイルファースト */
.container {
  max-width: 768px;
  margin: 0 auto;
  padding: 1rem;
}

/* タブレット以上 */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

---

## 認証・セキュリティ

### NextAuth設定

```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" }
      },
      async authorize(credentials) {
        // ユーザー認証ロジック
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) return null;
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        
        if (!isValid) return null;
        
        return {
          id: user.id,
          email: user.email,
          is_admin: user.is_admin
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.is_admin = user.is_admin;
      }
      
      // ユーザーの存在確認
      if (token.id) {
        const existingUser = await prisma.user.findUnique({
          where: { id: Number(token.id) }
        });
        
        if (!existingUser) {
          return null; // ユーザーが削除されている場合はログアウト
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.is_admin = token.is_admin;
      return session;
    }
  }
};
```

### ミドルウェア

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // 未認証の場合はログインページへリダイレクト
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // 管理者権限チェック
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token.is_admin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/consultation/:path*',
    '/history',
    '/mypage',
    '/admin/:path*'
  ]
};
```

### パスワードハッシュ化

```typescript
import bcrypt from 'bcrypt';

// ハッシュ化
const hashedPassword = await bcrypt.hash(password, 10);

// 検証
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## パフォーマンス最適化

### データベースクエリ最適化

```typescript
// ❌ N+1問題
const rooms = await prisma.chatRoom.findMany();
for (const room of rooms) {
  const messages = await prisma.chatMessage.findMany({
    where: { chat_room_id: room.id }
  });
}

// ✅ 最適化
const rooms = await prisma.chatRoom.findMany({
  include: {
    messages: {
      orderBy: { created_at: 'desc' },
      take: 10
    }
  }
});
```

### ページネーション

```typescript
const page = parseInt(searchParams.page) || 1;
const limit = 15;
const skip = (page - 1) * limit;

const [rooms, total] = await Promise.all([
  prisma.chatRoom.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    skip,
    take: limit
  }),
  prisma.chatRoom.count({
    where: { user_id: userId }
  })
]);
```

### ストリーミングレスポンス

```typescript
const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of response) {
      const content = chunk.choices[0]?.delta?.content || '';
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
      );
    }
    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
    controller.close();
  }
});

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  }
});
```

---

## テスト

### 単体テスト（準備中）

```bash
npm test
```

### E2Eテスト（準備中）

```bash
npm run test:e2e
```

---

## トラブルシューティング

### よくある問題

#### Prismaクライアントのエラー
```bash
# Prismaクライアントを再生成
npx prisma generate
```

#### データベース接続エラー
```bash
# マイグレーションをリセット
npx prisma migrate reset

# 再度マイグレーション
npx prisma migrate dev
```

#### ビルドエラー
```bash
# キャッシュをクリア
rm -rf .next
npm run build
```

---

**最終更新日**: 2026年2月19日
