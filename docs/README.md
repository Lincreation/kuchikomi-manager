# 口コミ管理ツール

## 背景・目的

講座ビジネスにおいて、受講生に口コミの投稿を依頼する際に「用意した口コミテンプレート」を配布することがあります。しかし、複数人が同じ口コミを使ってしまうと不自然になり、信頼性が下がります。

このツールは **講座ごとに口コミテンプレートを管理し、ユーザーがコピーしたら自動的に「使用済み」になる** ことで、口コミの被りを防止するWebアプリケーションです。

### 主な特徴
- スプレッドシート風のUIで直感的に操作可能
- コピーボタン1つで口コミをコピー＆自動使用済み
- 同じ口コミを2人が同時にコピーしようとした場合の競合制御
- 10秒ごとの自動更新で他ユーザーの操作がリアルタイムに反映
- スマホ対応（カードレイアウト自動切替）
- 管理者による講座・口コミ・ユーザーの一括管理

---

## 技術スタック

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 14 | フロントエンド＋バックエンド |
| TypeScript | - | 型安全な開発 |
| Tailwind CSS | 4 | スタイリング |
| SQLite (better-sqlite3) | - | データベース |
| NextAuth.js | 4 | 認証 |
| bcryptjs | - | パスワードハッシュ化 |

---

## ディレクトリ構成

```
sutoaka_口コミ管理/
├── src/
│   ├── app/
│   │   ├── page.tsx              # トップ（講座一覧）
│   │   ├── login/page.tsx        # ログイン画面
│   │   ├── courses/[id]/page.tsx # 口コミ一覧（ユーザー用）
│   │   ├── admin/
│   │   │   ├── page.tsx          # 管理画面（講座・ユーザー管理）
│   │   │   └── courses/[id]/page.tsx # 口コミ管理（管理者用）
│   │   ├── api/                  # APIエンドポイント
│   │   ├── layout.tsx            # 共通レイアウト
│   │   └── globals.css           # グローバルCSS
│   ├── components/
│   │   ├── AuthProvider.tsx      # 認証プロバイダー
│   │   └── Header.tsx            # ヘッダーコンポーネント
│   ├── lib/
│   │   ├── auth.ts               # NextAuth設定
│   │   ├── db.ts                 # DB接続・テーブル作成
│   │   └── seed.ts               # 初期データ投入
│   ├── types/
│   │   └── next-auth.d.ts        # 型定義拡張
│   └── middleware.ts             # 認証・認可ミドルウェア
├── data/                         # SQLiteデータベース（gitignore）
├── .env.local                    # 環境変数（gitignore）
├── package.json
└── tsconfig.json
```

---

## セットアップ手順

### 1. 前提条件
- Node.js 18以上がインストールされていること
- npm が使えること

### 2. 依存パッケージのインストール

```bash
cd sutoaka_口コミ管理
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成（既にある場合はスキップ）：

```
NEXTAUTH_SECRET=任意のシークレットキー（本番では長いランダム文字列に変更）
NEXTAUTH_URL=http://localhost:3000
```

### 4. 初期データの投入

```bash
npm run seed
```

これにより以下が作成されます：
- 管理者ユーザー: `admin@example.com` / `admin123`
- サンプル講座: 「サンプル講座」（口コミ5件付き）

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス。

---

## 使い方

### 一般ユーザー向け

#### ログイン
1. http://localhost:3000 にアクセス
2. 管理者から伝えられたメールアドレスとパスワードでログイン

#### 口コミをコピーする
1. トップページの講座一覧から、対象の講座をタップ
2. 口コミ一覧が表示される
3. 使いたい口コミの「コピー」ボタンをタップ
4. クリップボードにコピーされ、自動的に使用済みになる
5. そのまま口コミ投稿先に貼り付ける

#### 注意点
- 一度コピーした口コミは他のユーザーには表示されません
- 同時にコピーしようとした場合、先にコピーした人が優先されます
- ページは10秒ごとに自動更新されます

---

### 管理者向け

#### 講座を作成する
1. ヘッダーの「管理」をクリック
2. 「+ 講座追加」ボタンをクリック
3. 講座名と説明を入力して「保存」

#### 口コミを追加する

**個別追加:**
1. 管理画面 → 対象講座の「口コミ管理」をクリック
2. 「+ 口コミ追加」ボタンをクリック
3. 口コミ内容を入力して「追加」

**一括追加（おすすめ）:**
1. 管理画面 → 対象講座の「口コミ管理」をクリック
2. 「一括追加」ボタンをクリック
3. テキストエリアに1行1口コミで入力
4. 「一括追加」ボタンをクリック

例：
```
この講座は本当に役立ちました！
講師の説明がとてもわかりやすかったです。
実践的な内容で、すぐに活かせました。
初心者でも安心して受講できました。
コスパが良いと思います。おすすめです！
```

#### 口コミをリセットする
- 個別: 口コミ管理画面の「戻す」ボタン
- 一括: 「すべてリセット」ボタン（全口コミを未使用に戻す）

#### ユーザーを管理する
1. 管理画面 → 「ユーザー管理」タブ
2. 「+ ユーザー追加」で新規ユーザーを作成
3. ロール変更プルダウンで admin/user を切替

---

## 画面一覧

| URL | 画面名 | アクセス権限 |
|-----|--------|-------------|
| `/login` | ログイン | 誰でも |
| `/` | 講座一覧 | ログイン必須 |
| `/courses/[id]` | 口コミ一覧 | ログイン必須 |
| `/admin` | 管理画面 | admin のみ |
| `/admin/courses/[id]` | 口コミ管理 | admin のみ |

---

## API一覧

| メソッド | パス | 説明 | 権限 |
|----------|------|------|------|
| GET | `/api/courses` | 講座一覧取得 | ログイン |
| POST | `/api/courses` | 講座作成 | admin |
| PUT | `/api/courses/[id]` | 講座編集 | admin |
| DELETE | `/api/courses/[id]` | 講座削除 | admin |
| GET | `/api/courses/[id]/reviews` | 口コミ一覧取得 | ログイン |
| POST | `/api/courses/[id]/reviews` | 口コミ追加 | admin |
| POST | `/api/courses/[id]/reviews/bulk` | 口コミ一括追加 | admin |
| PUT | `/api/reviews/[id]` | 口コミ編集 | admin |
| DELETE | `/api/reviews/[id]` | 口コミ削除 | admin |
| POST | `/api/reviews/[id]/use` | 口コミ使用済みにする | ログイン |
| POST | `/api/reviews/[id]/reset` | 口コミ未使用に戻す | admin |
| GET | `/api/users` | ユーザー一覧 | admin |
| POST | `/api/users` | ユーザー作成 | admin |
| PUT | `/api/users/[id]` | ロール変更 | admin |
| DELETE | `/api/users/[id]` | ユーザー削除 | admin |

---

## データベース

SQLiteを使用。ファイルは `data/kuchikomi.db` に自動作成されます。

### テーブル構成

**users** - ユーザー
| カラム | 型 | 説明 |
|--------|------|------|
| id | INTEGER PK | ID |
| email | TEXT UNIQUE | メールアドレス |
| password | TEXT | bcryptハッシュ |
| name | TEXT | 表示名 |
| role | TEXT | 'admin' or 'user' |
| created_at | DATETIME | 作成日時 |

**courses** - 講座
| カラム | 型 | 説明 |
|--------|------|------|
| id | INTEGER PK | ID |
| name | TEXT | 講座名 |
| description | TEXT | 説明 |
| created_at | DATETIME | 作成日時 |

**reviews** - 口コミ
| カラム | 型 | 説明 |
|--------|------|------|
| id | INTEGER PK | ID |
| course_id | INTEGER FK | 講座ID |
| content | TEXT | 口コミ本文 |
| status | TEXT | 'available' or 'used' |
| used_by | INTEGER FK | 使用ユーザーID |
| used_at | DATETIME | 使用日時 |
| created_at | DATETIME | 作成日時 |

---

## トラブルシューティング

### サーバーが起動しない
```bash
# node_modulesを再インストール
rm -rf node_modules
npm install
```

### データベースをリセットしたい
```bash
# dataフォルダを削除して再シード
rm -rf data
npm run seed
```

### パスワードを忘れた
データベースを直接リセットするか、管理者に新しいユーザーを作成してもらってください。

### 本番環境にデプロイする場合
1. `NEXTAUTH_SECRET` を十分に長いランダム文字列に変更
2. `NEXTAUTH_URL` をデプロイ先のURLに変更
3. `npm run build && npm run start` で本番モードで起動
