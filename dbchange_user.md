# データベース移行とユーザー情報追加の方針

## 📋 概要

このドキュメントでは、以下2つの課題に対する実装方針をまとめています。

1. **DBを別アカウントのAWSに移行**
2. **新規登録に電話番号・姓名を追加**

---

## 1️⃣ DBを別アカウントのAWSに移行

### 🎯 推奨アプローチ

**ダウンタイムを最小限にする段階的移行**

---

### ステップ1: 新環境の準備

#### 新AWSアカウントでLightsail Database作成

| 項目         | 設定値                 |
| ------------ | ---------------------- |
| プラン       | Standard ($15/月)      |
| データベース | MySQL 8.0.43           |
| リージョン   | ap-northeast-1（東京） |
| SSL          | 有効化                 |

#### 接続確認

1. ローカルから新DBに接続テスト
2. Prismaでマイグレーション実行

```bash
# 新DBの接続文字列を一時的に.envに設定
DATABASE_URL="mysql://user:pass@new-host:3306/trouble?sslmode=require"

# マイグレーション実行
npx prisma migrate deploy
```

---

### ステップ2: データ移行

#### 1. 旧DBからデータエクスポート

```bash
# mysqldumpでデータをダンプ
mysqldump -h old-host -u dbmasteruser -p \
  --databases trouble \
  --single-transaction \
  --routines \
  --triggers \
  > backup.sql
```

#### 2. 新DBにインポート

```bash
# 新DBにリストア
mysql -h new-host -u newuser -p trouble < backup.sql
```

#### 3. データ整合性確認

- レコード数の一致確認
- サンプルデータの照合
- インデックスの確認

```sql
-- レコード数確認
SELECT 'User' as table_name, COUNT(*) as count FROM User
UNION ALL
SELECT 'Token', COUNT(*) FROM Token
UNION ALL
SELECT 'ChatRoom', COUNT(*) FROM ChatRoom
UNION ALL
SELECT 'Message', COUNT(*) FROM Message
UNION ALL
SELECT 'AccessLog', COUNT(*) FROM AccessLog;
```

---

### ステップ3: アプリケーション切り替え

#### 1. 環境変数の更新

**ローカル環境（`.env`）:**

```env
DATABASE_URL="mysql://newuser:newpass@new-host:3306/trouble?sslmode=require"
```

**Vercel環境変数:**

- Vercelダッシュボードで`DATABASE_URL`を更新
- productionブランチとmainブランチ両方

#### 2. 動作確認

- ✅ ログイン
- ✅ チャット機能
- ✅ 管理画面
- ✅ ユーザー登録

#### 3. 本番デプロイ

1. mainブランチにマージ
2. デプロイ後の動作確認
3. ログ監視

---

### ステップ4: 旧DB削除

- 1週間程度様子を見て問題なければ旧DB削除
- 削除前に最終バックアップを取得

---

### ⚠️ 注意点

| 項目                 | 内容                                   |
| -------------------- | -------------------------------------- |
| **ダウンタイム**     | 切り替え時に5-10分程度                 |
| **バックアップ**     | 移行前に必ず完全バックアップ           |
| **ロールバック計画** | 問題時は旧DBに戻せるよう環境変数を保持 |
| **監視**             | 移行後1週間は特に注意深く監視          |

---

## 2️⃣ 新規登録に電話番号・姓名を追加

### 🎯 推奨アプローチ

**段階的な実装で既存ユーザーに影響を与えない**

---

### ステップ1: データベーススキーマ変更

#### Userテーブルに追加するカラム

```prisma
model User {
  id              Int         @id @default(autoincrement())
  email           String      @unique
  password        String
  token_id        Int?        @unique
  is_admin        Boolean     @default(false)
  created_at      DateTime    @default(now())

  // 🆕 追加カラム
  phone_number    String?     @db.VarChar(20)  // 電話番号（任意）
  last_name       String?     @db.VarChar(50)  // 姓（任意）
  first_name      String?     @db.VarChar(50)  // 名（任意）

  // リレーション
  access_logs     AccessLog[]
  chat_rooms      ChatRoom[]
  tokens_assigned Token[]     @relation("AssignedTokens")
  token           Token?      @relation("UserToken", fields: [token_id], references: [id])
}
```

#### ポイント

| 項目                   | 説明                         |
| ---------------------- | ---------------------------- |
| ✅ **NULL許可（`?`）** | 既存ユーザーに影響なし       |
| ✅ **段階的移行**      | 既存ユーザーは後から入力可能 |
| ✅ **バリデーション**  | 新規登録時のみ必須にする     |

---

### ステップ2: マイグレーション実行

```bash
# 開発環境でスキーマ変更
npx prisma migrate dev --name add_user_profile_fields

# 本番環境にデプロイ
npx prisma migrate deploy
```

---

### ステップ3: API修正

#### `/api/users/route.ts` (POST) の修正

```typescript
// リクエストボディに追加
const { email, password, token, phoneNumber, lastName, firstName } =
  await request.json();

// バリデーション追加
if (!phoneNumber || !lastName || !firstName) {
  return NextResponse.json(
    { error: "電話番号、姓、名は必須です" },
    { status: 400 }
  );
}

// 電話番号の形式チェック（オプション）
const phoneRegex = /^0\d{1,4}-?\d{1,4}-?\d{4}$/;
if (!phoneRegex.test(phoneNumber)) {
  return NextResponse.json(
    { error: "電話番号の形式が正しくありません" },
    { status: 400 }
  );
}

// ユーザー作成時に追加
const newUser = await tx.user.create({
  data: {
    email,
    password: hashedPassword,
    token_id: tokenRecord?.id,
    phone_number: phoneNumber,
    last_name: lastName,
    first_name: firstName,
  },
});
```

---

### ステップ4: フロントエンド修正

#### `/src/app/register/page.tsx` の修正

**追加する入力フィールド:**

```tsx
{
  /* 姓 */
}
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">
    姓 <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="lastName"
    placeholder="山田"
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1888CF]"
  />
</div>;

{
  /* 名 */
}
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">
    名 <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    name="firstName"
    placeholder="太郎"
    required
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1888CF]"
  />
</div>;

{
  /* 電話番号 */
}
<div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">
    電話番号 <span className="text-red-500">*</span>
  </label>
  <input
    type="tel"
    name="phoneNumber"
    placeholder="090-1234-5678"
    required
    pattern="0\d{1,4}-?\d{1,4}-?\d{4}"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1888CF]"
  />
  <p className="text-xs text-gray-500 mt-1">ハイフンあり・なし両方可能です</p>
</div>;
```

**バリデーション追加:**

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);
  const lastName = formData.get("lastName") as string;
  const firstName = formData.get("firstName") as string;
  const phoneNumber = formData.get("phoneNumber") as string;

  // バリデーション
  if (!lastName || !firstName || !phoneNumber) {
    setError("すべての項目を入力してください");
    return;
  }

  // API呼び出し
  const response = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      token,
      lastName,
      firstName,
      phoneNumber,
    }),
  });

  // ...
};
```

---

### ステップ5: 既存ユーザー対応（オプション）

#### 方針A: 任意入力のまま（推奨）

- 既存ユーザーはNULLのまま
- 必要に応じてプロフィール編集機能で入力
- **メリット**: 既存ユーザーに影響なし
- **デメリット**: データが不完全な状態が続く

#### 方針B: 次回ログイン時に入力促す

- ログイン後、未入力の場合はモーダル表示
- 入力完了まで機能制限
- **メリット**: データの完全性を保てる
- **デメリット**: 既存ユーザーに手間をかける

---

### 📊 データ量への影響

#### 追加データ量

| カラム   | サイズ                   |
| -------- | ------------------------ |
| 電話番号 | 20バイト                 |
| 姓       | 50バイト                 |
| 名       | 50バイト                 |
| **合計** | **約120バイト/ユーザー** |

#### 影響

| ユーザー数     | 追加容量 | 影響度           |
| -------------- | -------- | ---------------- |
| 1,000ユーザー  | +120KB   | 無視できるレベル |
| 10,000ユーザー | +1.2MB   | 影響なし         |

---

## 🔄 実装順序の推奨

### パターンA: 安全重視（推奨）✅

**先にDB移行 → 動作確認 → その後に機能追加**

#### メリット

- ✅ 問題の切り分けが容易
- ✅ DB移行の影響を単独で確認できる
- ✅ ロールバックが簡単

#### デメリット

- ⚠️ マイグレーションが2回必要

---

### パターンB: 効率重視

**DB移行と機能追加を同時実行**

#### メリット

- ✅ マイグレーション1回で済む
- ✅ 作業時間の短縮

#### デメリット

- ⚠️ 問題発生時の原因特定が困難
- ⚠️ ロールバックが複雑

---

### 🎯 推奨: パターンA（安全重視）

- DB移行は慎重に行うべき
- 機能追加は後からでも問題なし
- リスクを最小限に抑える

---

## 📝 作業の流れ（パターンA）

### フェーズ1: DB移行（1-2日）

```mermaid
graph LR
    A[新DB作成] --> B[データ移行]
    B --> C[接続切り替え]
    C --> D[動作確認]
    D --> E[1週間監視]
```

#### 作業内容

1. ✅ 新AWS Lightsail Database作成
2. ✅ データ移行（mysqldump）
3. ✅ 接続切り替え（環境変数更新）
4. ✅ 動作確認（全機能テスト）
5. ✅ 1週間監視

---

### フェーズ2: 機能追加（1-2日）

```mermaid
graph LR
    A[スキーマ修正] --> B[マイグレーション]
    B --> C[API修正]
    C --> D[フロントエンド修正]
    D --> E[テスト]
    E --> F[デプロイ]
```

#### 作業内容

1. ✅ Prismaスキーマ修正
2. ✅ マイグレーション実行
3. ✅ API修正（`/api/users/route.ts`）
4. ✅ フロントエンド修正（`/src/app/register/page.tsx`）
5. ✅ テスト（ローカル環境）
6. ✅ デプロイ（production → main）

---

## ❓ 確認事項

実装を進める前に確認したいこと：

### 1. DB移行のタイミング

- [ ] いつ実施しますか？
- [ ] メンテナンス時間を設けますか？

### 2. 既存ユーザー対応

- [ ] 方針A: 任意入力のまま
- [ ] 方針B: 次回ログイン時に入力促す

### 3. 電話番号の形式

- [ ] ハイフンあり/なし両方許可？
- [ ] バリデーションの厳密さは？
- [ ] 国際電話番号は考慮する？

### 4. 実装順序

- [ ] パターンA（安全重視）- 推奨
- [ ] パターンB（効率重視）

---

## 🚀 次のステップ

この方針で進めてよければ、具体的な実装を開始します！

1. **DB移行を先に実施する場合**

   - 新AWSアカウントの準備
   - Lightsail Databaseの作成手順を案内

2. **機能追加を先に実施する場合**
   - Prismaスキーマの修正
   - API・フロントエンドの実装

どちらから始めますか？

---

**作成日**: 2025年12月26日  
**最終更新**: 2025年12月26日
