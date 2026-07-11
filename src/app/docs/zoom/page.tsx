import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing-chrome";
import { SERVICE_NAME, SUPPORT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Zoom連携 | ${SERVICE_NAME}`,
  description: `${SERVICE_NAME} の Zoom 連携の追加・利用・解除方法`,
};

export default function ZoomDocsPage() {
  return (
    <LegalPageShell
      title="Zoom連携"
      description={`${SERVICE_NAME} と Zoom を連携し、日程調整完了時に Zoom ミーティング URL を自動発行する方法です。`}
    >
      <p>
        Zoom 連携を利用すると、予約が確定したタイミングで Zoom
        ミーティングを自動発行できます。
      </p>

      <LegalSection title="自動発行に必要な設定">
        <p>日程調整完了と同時に Zoom ミーティングを発行するには、次の 2 点が必要です。</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>アカウントごとの設定</strong>
            ：{SERVICE_NAME} アカウントと Zoom アカウントの連携
          </li>
          <li>
            <strong>カレンダーごとの設定</strong>
            ：対象カレンダーの「Web会議」で「Zoom」を選択
          </li>
        </ol>
        <p>
          カレンダー側で「Zoom」を選んだあとにアカウント連携を行った場合は、カレンダー設定をもう一度保存してください。
        </p>
      </LegalSection>

      <LegalSection title="連携に必要なもの">
        <ul className="list-disc pl-5 space-y-1">
          <li>Zoom アカウント（無料プランまたは有料プラン）</li>
          <li>{SERVICE_NAME} アカウント</li>
          <li>Zoom App Marketplace での本アプリの承認（認可）</li>
        </ul>
      </LegalSection>

      <LegalSection title="1. Zoom アカウントを連携する（アカウント設定）">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            {SERVICE_NAME} にログインします。
          </li>
          <li>
            <Link
              href="/account/integrations"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              サービス連携
            </Link>
            （
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /account/integrations
            </code>
            ）を開きます。
          </li>
          <li>
            Zoom セクションの「Zoom と連携する」をクリックします。
          </li>
          <li>
            Zoom の認可画面が表示されたら、内容を確認して「Allow / 許可」をクリックします。
          </li>
          <li>
            {SERVICE_NAME} のサービス連携画面に戻り、「連携済み」と表示されれば完了です。
          </li>
        </ol>
      </LegalSection>

      <LegalSection title="2. カレンダーで Zoom を使う（カレンダー設定）">
        <ol className="list-decimal pl-5 space-y-2">
          <li>ダッシュボードから対象のカレンダーを開き、編集画面へ進みます。</li>
          <li>
            「Web会議」項目で <strong>Zoom</strong> を選択します。
          </li>
          <li>設定を保存します。</li>
        </ol>
        <p>
          この設定後、公開予約ページから予約が確定すると、Zoom ミーティング URL
          が自動発行され、予約内容とともに相手へ共有されます。Google
          カレンダー側の予定にも会議情報が反映されます。
        </p>
      </LegalSection>

      <LegalSection title="連携を解除する（アプリ側）">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <Link
              href="/account/integrations"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              サービス連携
            </Link>
            を開きます。
          </li>
          <li>Zoom セクションの「連携を解除」をクリックします。</li>
          <li>確認ダイアログで解除を承認します。</li>
        </ol>
        <p>注意事項:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            連携を解除すると、{SERVICE_NAME}{" "}
            から Zoom ミーティングを新規発行できなくなります。
          </li>
          <li>
            解除時に本サービス側に保存していた Zoom
            連携トークン等は削除されます（Zoom のポリシーに基づく対応です）。
          </li>
          <li>
            すでに Zoom 上に作成済みのミーティング自体は Zoom
            側に残ります。必要に応じて Zoom 上で管理・削除してください。
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="連携を解除する（Zoom 側）">
        <p>
          Zoom App Marketplace から本アプリをアンインストールすることでも解除できます。
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Zoom アカウントにログインします。</li>
          <li>
            <a
              href="https://marketplace.zoom.us/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              Zoom App Marketplace
            </a>
            を開きます。
          </li>
          <li>右上の Manage → Added Apps を開きます。</li>
          <li>{SERVICE_NAME}（本アプリ）を探し、Remove をクリックします。</li>
        </ol>
      </LegalSection>

      <LegalSection title="お問い合わせ">
        <p>
          Zoom 連携に関するご質問は{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-primary underline underline-offset-2 hover:opacity-80"
          >
            {SUPPORT_EMAIL}
          </a>{" "}
          までご連絡ください。
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
