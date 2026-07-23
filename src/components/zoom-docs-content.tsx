"use client";

import Link from "next/link";
import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing-chrome";
import { SERVICE_NAME, SUPPORT_EMAIL } from "@/lib/brand";

type Lang = "ja" | "en";

const linkClass =
  "text-primary underline underline-offset-2 hover:opacity-80";

function resolveLang(raw: string | null): Lang {
  return raw === "en" ? "en" : "ja";
}

function LanguageSwitcher({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (next: Lang) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <span className="sr-only">Language</span>
      <div className="inline-flex rounded-lg border border-border bg-white p-0.5 text-sm">
        <button
          type="button"
          onClick={() => onChange("ja")}
          className={
            lang === "ja"
              ? "rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white"
              : "rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-900"
          }
          aria-pressed={lang === "ja"}
        >
          日本語
        </button>
        <button
          type="button"
          onClick={() => onChange("en")}
          className={
            lang === "en"
              ? "rounded-md bg-gray-900 px-3 py-1.5 font-medium text-white"
              : "rounded-md px-3 py-1.5 text-gray-600 hover:text-gray-900"
          }
          aria-pressed={lang === "en"}
        >
          English
        </button>
      </div>
    </div>
  );
}

function JapaneseContent() {
  return (
    <>
      <p>
        Zoom 連携を利用すると、予約が確定したタイミングで Zoom
        ミーティングを自動発行できます。
      </p>

      <LegalSection title="自動発行に必要な設定">
        <p>
          日程調整完了と同時に Zoom ミーティングを発行するには、次の 2
          点が必要です。
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>アカウントごとの設定</strong>：{SERVICE_NAME}{" "}
            アカウントと Zoom アカウントの連携
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

      <LegalSection id="adding-the-app" title="Adding the App（アプリの追加）">
        <ol className="list-decimal pl-5 space-y-2">
          <li>{SERVICE_NAME} にログインします。</li>
          <li>
            <Link href="/account/integrations" className={linkClass}>
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
            Zoom の認可画面が表示されたら、内容を確認して「Allow /
            許可」をクリックします。
          </li>
          <li>
            {SERVICE_NAME}{" "}
            のサービス連携画面に戻り、「連携済み」と表示されれば完了です。
          </li>
        </ol>
        <p>
          追加時にうまくいかない場合は、
          <a href="#troubleshooting" className={linkClass}>
            トラブルシューティング
          </a>
          をご確認ください。
        </p>
      </LegalSection>

      <LegalSection id="usage" title="Usage（利用方法）">
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

      <LegalSection id="removing-the-app" title="Removing the App（アプリの削除）">
        <p className="font-medium text-gray-900">アプリ側で解除する</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <Link href="/account/integrations" className={linkClass}>
              サービス連携
            </Link>
            を開きます。
          </li>
          <li>Zoom セクションの「連携を解除」をクリックします。</li>
          <li>確認ダイアログで解除を承認します。</li>
        </ol>

        <p className="font-medium text-gray-900">Zoom 側で解除する</p>
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
              className={linkClass}
            >
              Zoom App Marketplace
            </a>
            を開きます。
          </li>
          <li>右上の Manage → Added Apps を開きます。</li>
          <li>{SERVICE_NAME}（本アプリ）を探し、Remove をクリックします。</li>
        </ol>

        <p className="font-medium text-gray-900">解除時の注意事項（データ取り扱い）</p>
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
          <li>
            過去の予約データ（ゲスト名・日時・発行済みミーティング URL 等）は、
            <Link href="/privacy" className={linkClass}>
              プライバシーポリシー
            </Link>
            に従って保持されます。Zoom
            連携解除だけでは過去の予約履歴は自動削除されません。
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="troubleshooting" title="Troubleshooting（トラブルシューティング）">
        <p className="font-medium text-gray-900">
          サービス連携を開くとログイン画面に遷移する
        </p>
        <p>
          {SERVICE_NAME}{" "}
          にログインしたうえで、再度サービス連携ページを開いてください。
        </p>

        <p className="font-medium text-gray-900">認可に失敗する / エラーになる</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Zoom の許可画面で Allow / 許可を選択したか確認してください。</li>
          <li>
            サービス連携から再度「Zoom と連携する」を試してください。途中で止まっている場合は「連携を解除」後に再連携してください。
          </li>
          <li>
            ブラウザのポップアップブロックやサードパーティ Cookie
            制限により、認可後の戻りが遮断されていないか確認してください。
          </li>
        </ul>

        <p className="font-medium text-gray-900">
          連携済みなのに Zoom URL が発行されない
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            カレンダーの「Web会議」が Zoom
            になっていること、連携後に設定を再保存したことを確認してください。
          </li>
          <li>Google カレンダー連携が有効か確認してください。</li>
          <li>
            Zoom を再連携したうえで、テスト予約を再度作成してください。
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="お問い合わせ">
        <p>
          Zoom 連携に関するご質問は{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            {SUPPORT_EMAIL}
          </a>{" "}
          までご連絡ください。
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>対応時間: 平日 10:00–18:00（日本時間・祝日除く）</li>
          <li>初回返信目安: 2 営業日以内</li>
        </ul>
      </LegalSection>
    </>
  );
}

function EnglishContent() {
  return (
    <>
      <p>
        <strong>This app is intended for a Japanese-speaking audience.</strong>
      </p>
      <p>
        When Zoom is connected, {SERVICE_NAME} can automatically create a Zoom
        meeting URL when a guest confirms a booking.
      </p>

      <LegalSection title="Requirements">
        <ul className="list-disc pl-5 space-y-1">
          <li>A Zoom account (Free or paid)</li>
          <li>A {SERVICE_NAME} account</li>
          <li>Authorization of this app on Zoom App Marketplace</li>
        </ul>
        <p>
          To auto-create Zoom meetings you need both: (1) account-level Zoom
          connection, and (2) calendar-level meeting type set to Zoom.
        </p>
      </LegalSection>

      <LegalSection id="adding-the-app" title="Adding the App">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Open{" "}
            <Link href="/account/integrations" className={linkClass}>
              https://calendar-app.me/account/integrations
            </Link>
            . If you are not logged in, you will be redirected to login first.
          </li>
          <li>Sign in to {SERVICE_NAME} with Google if prompted.</li>
          <li>
            On Integrations, click <strong>Zoom と連携する</strong> (Connect
            with Zoom).
          </li>
          <li>
            On the Zoom authorization screen, review permissions and click{" "}
            <strong>Allow</strong>.
          </li>
          <li>
            When the status shows <strong>連携済み</strong> (Connected), the
            app has been added.
          </li>
        </ol>
        <p>
          If you have trouble adding the app, see{" "}
          <a href="#troubleshooting" className={linkClass}>
            Troubleshooting
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="usage" title="Usage">
        <p>
          <strong>Use case:</strong> When a guest books a slot on your public
          page, {SERVICE_NAME} creates a Zoom meeting and shares the join URL
          with the booking (and on Google Calendar when applicable).
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Open the{" "}
            <Link href="/dashboard" className={linkClass}>
              Dashboard
            </Link>{" "}
            and edit the target calendar.
          </li>
          <li>
            Under <strong>Web会議</strong>, select <strong>Zoom</strong>.
          </li>
          <li>Save the calendar settings.</li>
          <li>Share the public booking URL with your guest.</li>
          <li>
            When the guest confirms a booking, a Zoom meeting is created
            automatically.
          </li>
        </ol>
        <p>
          If you selected Zoom before connecting your Zoom account, save the
          calendar settings again after connecting.
        </p>
      </LegalSection>

      <LegalSection id="removing-the-app" title="Removing the App">
        <p className="font-medium text-gray-900">
          Option A — Remove from {SERVICE_NAME}
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Open{" "}
            <Link href="/account/integrations" className={linkClass}>
              Integrations
            </Link>
            .
          </li>
          <li>
            Click <strong>連携を解除</strong> (Disconnect).
          </li>
          <li>Confirm the dialog.</li>
        </ol>

        <p className="font-medium text-gray-900">
          Option B — Remove from Zoom App Marketplace
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Sign in to Zoom.</li>
          <li>
            Open{" "}
            <a
              href="https://marketplace.zoom.us/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Zoom App Marketplace
            </a>
            .
          </li>
          <li>Go to Manage → Added Apps.</li>
          <li>
            Find <strong>{SERVICE_NAME}</strong> and click{" "}
            <strong>Remove</strong>.
          </li>
        </ol>

        <p className="font-medium text-gray-900">
          Implications of de-authorization / data handling
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            {SERVICE_NAME} can no longer create new Zoom meetings for your
            calendars.
          </li>
          <li>
            OAuth tokens stored by {SERVICE_NAME} for Zoom are deleted when you
            disconnect in the app, or when we process Zoom deauthorization.
          </li>
          <li>
            Meetings already created remain in your Zoom account. Manage or
            delete them in Zoom if needed.
          </li>
          <li>
            Historical bookings in {SERVICE_NAME} are retained per our{" "}
            <Link href="/privacy" className={linkClass}>
              Privacy Policy
            </Link>
            . Removing Zoom does not automatically delete past bookings.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="troubleshooting" title="Troubleshooting">
        <p className="font-medium text-gray-900">
          I am redirected to login when opening Integrations
        </p>
        <p>
          Sign in with your {SERVICE_NAME} Google account, then open{" "}
          <Link href="/account/integrations" className={linkClass}>
            /account/integrations
          </Link>{" "}
          again.
        </p>

        <p className="font-medium text-gray-900">
          Authorization fails or returns an error
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Confirm you clicked Allow on the Zoom consent screen.</li>
          <li>
            Retry from Integrations. If needed, disconnect and reconnect.
          </li>
          <li>
            Check that pop-ups or third-party cookie settings are not blocking
            the OAuth return to calendar-app.me.
          </li>
        </ul>

        <p className="font-medium text-gray-900">
          Status is Connected, but no Zoom URL is created
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Confirm the calendar meeting type is Zoom and settings were saved
            after connecting.
          </li>
          <li>Confirm Google Calendar is still connected.</li>
          <li>Reconnect Zoom, then place a new test booking.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Contact Support">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Email:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
              {SUPPORT_EMAIL}
            </a>
          </li>
          <li>
            Support hours: Monday–Friday, 10:00–18:00 JST (excluding Japanese
            holidays)
          </li>
          <li>First response SLA: within 2 business days</li>
        </ul>
      </LegalSection>
    </>
  );
}

export function ZoomDocsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = resolveLang(searchParams.get("lang"));

  const setLang = useCallback(
    (next: Lang) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "ja") {
        params.delete("lang");
      } else {
        params.set("lang", "en");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const title =
    lang === "ja" ? "Zoom連携" : "Zoom Integration Guide";
  const description =
    lang === "ja"
      ? `${SERVICE_NAME} と Zoom を連携し、日程調整完了時に Zoom ミーティング URL を自動発行する方法です。`
      : `How to add, use, and remove the Zoom integration for ${SERVICE_NAME}.`;

  return (
    <LegalPageShell
      title={title}
      description={description}
      headerAction={<LanguageSwitcher lang={lang} onChange={setLang} />}
    >
      {lang === "ja" ? <JapaneseContent /> : <EnglishContent />}
    </LegalPageShell>
  );
}
