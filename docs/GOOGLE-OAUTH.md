# Google OAuth 設定（calendar-app.me）

## Google Cloud Console — OAuth クライアント ID

**アプリケーションの種類:** ウェブ アプリケーション  
**名前:** アポラク日程調整ツール（任意）

### 承認済みの JavaScript 生成元

ローカル開発と本番の **両方** を登録する。

```
http://localhost:3002
https://calendar-app.me
```

### 承認済みのリダイレクト URI

Auth.js のコールバック URL。**末尾まで完全一致** が必要。

```
http://localhost:3002/api/auth/callback/google
https://calendar-app.me/api/auth/callback/google
```

> `https://calendar-app.me` だけでは動かない。必ず `/api/auth/callback/google` まで含める。

---

## その他の Console 設定

### API 有効化（API とサービス → ライブラリ）

- Google Calendar API

### データアクセス（Google Auth Platform → データアクセス）

追加するスコープ:

| スコープ | 用途 |
|---------|------|
| `.../auth/userinfo.email` | メール取得 |
| `.../auth/userinfo.profile` | プロフィール |
| `.../auth/calendar.readonly` | 空き時間取得 |
| `.../auth/calendar.events` | 予定登録 |

### 対象（Google Auth Platform → 対象）

- ユーザータイプ: **外部**（一般公開前はテスト）
- **テストユーザー** に開発・検証用 Gmail を追加

### ブランディング（Google Auth Platform → ブランディング）

- アプリ名、サポートメール、ホームページ: `https://calendar-app.me`

---

## 環境変数

### ローカル（`.env`）

```env
NEXTAUTH_URL="http://localhost:3002"
AUTH_URL="http://localhost:3002"

GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
```

### 本番（Vercel 等）

```env
NEXTAUTH_URL="https://calendar-app.me"
AUTH_URL="https://calendar-app.me"

GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"
```

ローカル・本番で **同じ OAuth クライアント ID** を使える（上記のとおり URI を両方登録しておく）。

---

## 公開 URL の例

本番ドメイン確定後、カレンダーの公開 URL は次の形式になる。

```
https://calendar-app.me/{slug}
```

Google 予約ページ（`calendar.app.google/{slug}`）と同様、**slug のみ**の短い URL。

```
https://calendar-app.me/FW4awsNdUMWJ2xvn7
```

---

## トラブルシュート

| エラー | 原因 | 対処 |
|--------|------|------|
| `Missing required parameter: client_id` | `.env` 未設定 | `GOOGLE_CLIENT_ID` を設定して再起動 |
| `redirect_uri_mismatch` | リダイレクト URI 不一致 | Console の URI と `AUTH_URL` を確認 |
| `access_denied` | テストユーザー未追加 | 対象 → テストユーザーに Gmail を追加 |
