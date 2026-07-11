export type BookingEmailAudience = "guest" | "host";

export type BookingEmailTemplateKey = "guest" | "host";

export type BookingEmailTemplateDef = {
  key: BookingEmailTemplateKey;
  audience: BookingEmailAudience;
  subject: string;
  body: string;
};

export const BOOKING_EMAIL_TEMPLATE_KEYS: BookingEmailTemplateKey[] = [
  "guest",
  "host",
];

export const BOOKING_EMAIL_VARIABLE_GROUPS = [
  {
    id: "guest",
    variables: [
      "{ゲスト名}",
      "{ゲストメール}",
      "{ゲスト電話}",
      "{ゲスト会社名}",
    ],
    chipClassName:
      "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-900",
  },
  {
    id: "host",
    variables: ["{ホスト名}", "{ホスト会社名}"],
    chipClassName:
      "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-900",
  },
  {
    id: "schedule",
    variables: ["{日時}", "{会議URL}", "{キャンセルURL}", "{経由}"],
    chipClassName:
      "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-950",
  },
] as const;

export const BOOKING_EMAIL_VARIABLES = BOOKING_EMAIL_VARIABLE_GROUPS.flatMap(
  (group) => [...group.variables]
);

export const DEFAULT_BOOKING_EMAIL_TEMPLATES: BookingEmailTemplateDef[] = [
  {
    key: "guest",
    audience: "guest",
    subject: "【予約確定】{ホスト会社名} / {ホスト名}（{日時}）",
    body: `{ゲスト名} 様

{ホスト会社名}とのお打ち合わせ予約を受け付け、下記の内容で確定しました。

ーーーーーーーーーーーーーーーーーーー
■ 日時
{日時}

■ 打ち合わせ相手
{ホスト会社名} / {ホスト名}

■ 会議URL
{会議URL}

■ 変更・キャンセル
{キャンセルURL}
ーーーーーーーーーーーーーーーーーーー

※このメールは日程調整ツールからの自動配信です。このメールへの返信は受け付けていません。`,
  },
  {
    key: "host",
    audience: "host",
    subject: "【アポイントが入りました】 {ゲスト会社名} / {ゲスト名}（{日時}）",
    body: `{ホスト名} 様

新しいアポイントが入りました。

ーーーーーーーーーーーーーーーーーーー
■ 日時
{日時}

■ 相手
会社: {ゲスト会社名}
氏名: {ゲスト名}
メール: {ゲストメール}
電話: {ゲスト電話}

■ 会議URL
{会議URL}

■ 経由
{経由}
ーーーーーーーーーーーーーーーーーーー

※このメールは日程調整ツールからの自動配信です。このメールへの返信は受け付けていません。`,
  },
];

export function templateKey(audience: BookingEmailAudience): BookingEmailTemplateKey {
  return audience;
}
