# 日程調整ツール

TimeRex 代替の自社日程調整 SaaS。Google カレンダー連携・公開予約ページ・Zoom / Google Meet 対応（Phase 2）を提供する。

## ドキュメント

- [設計書](./docs/DESIGN.md)（**配信リンク設計含む**）
- [Google OAuth 設定（calendar-app.me）](./docs/GOOGLE-OAUTH.md)

## ドメイン

| 環境 | URL |
|------|-----|
| ローカル | http://localhost:3002 |
| 本番 | https://calendar-app.me |

## セットアップ

```bash
cp .env.example .env
# DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET を設定

npm install
npm run db:push
npm run dev
```

開発サーバー: http://localhost:3002

## フェーズ

| Phase | 内容 | 状態 |
|-------|------|------|
| 1 | コア（Google 連携・カレンダー CRUD・公開予約ページ） | 着手 |
| 2 | Zoom / Meet・設問・メール・キャンセル/リスケ | 未着手 |
| 3 | Webhook（TimeRex 互換） | 未着手 |
| 4 | 配信リンク（企業・経由・文面）+ アポラク連携 | 設計済 |

## URL 構造

```
/{slug}   … 公開予約ページ（Google 予約ページ風）
/dashboard                     … 管理画面
/calendars                     … カレンダー管理
```

## 技術スタック

- Next.js 15 (App Router) + TypeScript
- PostgreSQL + Prisma
- Auth.js (Google OAuth)
- Google Calendar API / Zoom API
