# 学校内情報・コミュニケーション基盤 Frontend

学校内に分散している連絡・質問・相談を一つに集約し、必要な情報へアクセスしやすくするためのWebアプリケーションのフロントエンドです。

## 解決したい課題

- Classroom、メール、口頭など、情報経路が複数の場所に分散している
- 生徒が誰に質問すべきか分からない
- 担当教員が不在のときに質問・相談が止まってしまう
- 配信した連絡を対象者の誰が既読にしたか分からない

## 解決方法

- **所属別情報配信**：学年、クラス、部活動、委員会、部署単位で必要な連絡を表示
- **質問の担当部署ルーティング**：質問カテゴリから担当部署を明確にする
- **公開質問 / 個別相談**：質問内容に応じて公開範囲を選択
- **明示的な既読**：連絡詳細の「既読にする」を押した時点で記録
- **横断検索**：お知らせ、質問・回答、担当窓口を一つの検索画面から探す

## 主な機能

- メールアドレスとパスワードによるログイン・ログアウト
- Roleに応じたホーム・ナビゲーション（全Role共通ヘッダーからログアウト可能）
- 所属別に配信された学校連絡のタイムライン
- 連絡詳細と明示的な既読登録
- 連絡作成者・管理者向けの既読集計と、既読・未読ユーザー表示
- 期限切れ連絡の非表示と、期限なしで6か月以上経過した連絡への注意表示
- 投稿者本人・管理者向けの連絡編集と、確認ダイアログ付き削除
- 質問カテゴリ名・担当部署の編集と、不要カテゴリの無効化
- 公開質問、個別相談、回答、解決
- 学校内横断検索
- 管理者によるアカウント追加（ユーザー名、メールアドレス、初期パスワード、Role）
- 管理者向けユーザーRole・有効状態、所属、質問カテゴリ管理

## Role

| Role | 主な画面・操作 |
| --- | --- |
| `student` | 連絡の閲覧・既読登録、質問・相談、検索 |
| `teacher` | 生徒の機能に加え、連絡作成、既読状況の閲覧、質問への回答 |
| `admin` | 教員の機能に加え、アカウント発行、ユーザー、所属、質問カテゴリの管理 |

## 使用技術

- React 19.2
- TypeScript 6.0
- Vite 8.1
- React Router 7.18
- Tailwind CSS 4
- Docker / Docker Compose

## セットアップ

### 1. バックエンドを起動

バックエンドリポジトリで実行します。

```bash
docker compose up --build
```

### 2. フロントエンドを起動

このリポジトリで実行します。

```bash
docker compose up --build
```

### 3. ブラウザでアクセス

```text
http://localhost:5173/login
```

APIの接続先は環境変数`VITE_API_BASE_URL`で指定します。未指定時は開発用の`http://localhost:8080`を使用します。

```bash
cp .env.example .env
```

## 主な画面とルート

| パス | 対象Role | 内容 |
| --- | --- | --- |
| `/login` | 未ログイン | ログイン |
| `/` | 全Role | Role別ホーム |
| `/timeline` | 全Role | 学校からの連絡 |
| `/school-posts/:id` | 全Role | 連絡詳細・対象者による既読登録 |
| `/school-posts/:id/edit` | 投稿者 / admin | 連絡内容・配信対象の編集 |
| `/school-posts/new` | teacher / admin | 学校連絡の作成 |
| `/teacher/school-posts` | teacher / admin | 自分が作成した連絡と既読者の一覧 |
| `/teacher/school-posts/:id/status` | 連絡作成者 / admin | 既読状況と既読・未読ユーザー |
| `/questions` | 全Role | 質問・相談一覧 |
| `/questions/new` | 全Role | 公開質問・個別相談の作成 |
| `/questions/:id` | 全Role | 質問詳細（teacher / adminは回答、生徒は自分の質問を解決済みに変更可能） |
| `/search` | 全Role | 学校内横断検索 |
| `/admin/users` | admin | アカウント追加、Role・有効状態の管理 |
| `/admin/groups` | admin | 所属管理 |
| `/admin/question-categories` | admin | 質問カテゴリ管理 |

現在、利用者向けの公開新規登録画面はありません。アカウントは管理者が`/admin/users`から発行します。

## デザイン

学校内で毎日利用することを想定し、薄い青灰色の背景、白いカード、濃紺の文字を使った明るく読みやすいUIにしています。緊急・重要・通常の情報を色で判別できる設計です。

## 開発時の確認

```bash
npm run lint
npm run build
```

Docker上で確認する場合：

```bash
docker compose exec -T app npm run lint
docker compose exec -T app npm run build
```

## デモデータ

バックエンドには、Role・所属・学校連絡・既読状態・質問・回答・検索結果をまとめて作成する開発用seedがあります。通常起動では追加されません。

```bash
cd ../Todoku_golang_backend
docker compose up -d postgres
docker compose run --rm -e DEMO_SEED=true backend go run ./cmd/seed
```

seed実行時に、デモ用のメールアドレスと初期パスワードが表示されます。詳細なアカウント一覧と操作シナリオはバックエンドの`docs/DEMO.md`を参照してください。

## 主なディレクトリ構成

```text
src/
├── api/                  # バックエンドAPIとの通信
├── assets/               # 画像
├── components/
│   └── school/           # 学校機能の共通レイアウト
├── contexts/             # 認証状態
├── pages/
│   ├── admin/            # 管理者画面
│   ├── auth/             # ログイン・Role別ルート保護
│   └── school/           # 連絡・質問・検索・ホーム
├── types/                # TypeScriptの型定義
├── App.tsx               # ルーティング
└── main.tsx              # エントリーポイント
```
