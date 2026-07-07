# Twitter Clone Frontend

Twitter風アプリケーションのフロントエンドです。React、TypeScript、Vite、Tailwind CSSで構築しています。

現在は、名前・メールアドレス・生年月日・パスワードを入力する2段階の新規登録画面と、Goバックエンドの新規登録APIとの連携を実装しています。

## 使用技術

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS 4
- Docker / Docker Compose

## セットアップ
### Dockerで起動する

```bash
docker compose up --build
```
ブラウザで以下へアクセスします。

```text
http://localhost:5173/login
```

## 画面とルート

| パス | 内容 |
| --- | --- |
| `/login` | ログイン画面 |
| `/register/email_name_birthday` | 名前・メールアドレス・生年月日の入力 |
| `/register/password` | パスワードの入力と新規登録 |

登録画面の入力値は `RegisterContext` で共有します。登録完了後は入力値を初期化し、ログイン画面へ遷移します。

## API連携

新規登録時に以下のAPIを呼び出します。

```http
POST http://localhost:8080/api/signup
Content-Type: application/json
```

リクエスト例：

```json
{
  "name": "テストユーザー",
  "email": "test@example.com",
  "birthday": "2000-01-01",
  "password": "password123"
}
```

## 主なディレクトリ構成

```text
src/
├── api/                 # バックエンドAPIの呼び出し
├── contexts/            # 登録フォームの状態管理
├── pages/
│   └── auth/
│       ├── login/       # ログイン画面
│       └── register/    # 新規登録画面
├── types/               # TypeScriptの型定義
├── App.tsx              # ルーティング
├── main.tsx             # エントリーポイント
└── tailwind.css         # Tailwind CSSの読み込み
```

## バックエンドとの起動順序

新規登録を動作確認するときは、以下を起動します。

1. GoバックエンドとPostgreSQL
2. Reactフロントエンド
3. `http://localhost:5173/login` へアクセス