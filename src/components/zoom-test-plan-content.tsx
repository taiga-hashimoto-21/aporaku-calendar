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
        このページは Zoom Marketplace
        審査担当者向けのテストプランです。アプリ認可、利用スコープ、予約確定時の
        Zoom ミーティング作成までの手順を記載します。
      </p>
      <p>
        エンドユーザー向けガイド:{" "}
        <Link href="/docs/zoom" className={linkClass}>
          https://calendar-app.me/docs/zoom
        </Link>
      </p>

      <LegalSection id="overview" title="1. アプリ概要">
        <p>
          <strong>{SERVICE_NAME}</strong> は{" "}
          <a href="https://calendar-app.me" className={linkClass}>
            https://calendar-app.me
          </a>{" "}
          で提供する日程調整サービスです。ホストは Google
          カレンダーと連携し、任意で Zoom も連携できます。公開予約ページでゲストが予約し、カレンダーの Web
          会議が Zoom の場合、予約確定時に Zoom ミーティングを作成して join URL
          を予約に紐づけます。
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            本番ドメイン:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              https://calendar-app.me
            </code>
          </li>
          <li>
            Direct Landing URL（From your site）:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              https://calendar-app.me/account/integrations
            </code>
          </li>
          <li>
            OAuth リダイレクト URI:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              https://calendar-app.me/api/auth/callback/zoom
            </code>
          </li>
          <li>アカウント作成: Google による無料のセルフサインアップ</li>
        </ul>
      </LegalSection>

      <LegalSection id="prerequisites" title="2. 審査時の前提">
        <ol className="list-decimal pl-5 space-y-2">
          <li>Marketplace アプリを認可できる Zoom アカウント</li>
          <li>
            {SERVICE_NAME} へのログイン用 Google アカウント
          </li>
          <li>
            ゲスト役として公開予約ページを開くための別ブラウザ / シークレットウィンドウ
          </li>
        </ol>
        <p>
          {SERVICE_NAME} のテスト用アカウントの事前提供は不要です。審査担当者は{" "}
          <a href="https://calendar-app.me/signup" className={linkClass}>
            https://calendar-app.me/signup
          </a>{" "}
          から Google ログインで無料登録できます。
        </p>
      </LegalSection>

      <LegalSection id="authorization" title="3. アプリ認可（OAuth）">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <a
              href="https://calendar-app.me/account/integrations"
              className={linkClass}
            >
              https://calendar-app.me/account/integrations
            </a>{" "}
            を開きます。
          </li>
          <li>
            未ログインの場合は{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /login?callbackUrl=/account/integrations
            </code>{" "}
            にリダイレクトされます。Google
            でログインし、必要なら会社名オンボーディングを完了します。
          </li>
          <li>
            サービス連携画面の Zoom で「Zoom と連携する」をクリックします。
          </li>
          <li>
            Zoom の認可画面でスコープを確認し、<strong>Allow / 許可</strong>{" "}
            をクリックします。
          </li>
          <li>
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /account/integrations
            </code>{" "}
            に戻り、Zoom が「連携済み」と表示されれば完了です。
          </li>
        </ol>
        <p>
          期待結果: ログイン中ホストの Zoom
          連携トークンが保存され、以降 Zoom API を利用できます。
        </p>
      </LegalSection>

      <LegalSection id="scopes" title="4. スコープと確認方法">
        <p>本アプリが要求する granular scopes は次のとおりです。</p>

        <p className="font-medium text-gray-900">
          user:read:user — View a user
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            OAuth コールバック時に{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              GET /users/me
            </code>{" "}
            を呼び、Zoom ユーザー ID を連携情報に保存します。
          </li>
          <li>確認: セクション 3 の認可を完了し、連携済みになること。</li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:write:meeting — Create a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Web 会議が Zoom のカレンダーでゲストが予約確定したとき、{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              POST /users/me/meetings
            </code>{" "}
            でミーティングを作成します。
          </li>
          <li>確認: セクション 5 の一連の予約テスト。</li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:read:meeting — View a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            作成済みミーティングの表示・検証のために利用します。
          </li>
          <li>
            確認: セクション 5 のあと、Zoom
            上で作成されたミーティングの題名・日時・join URL が予約と一致すること。
          </li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:update:meeting — Update a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            予約情報の変更に伴うミーティング更新（ゲスト情報・アジェンダ等）向けです。
          </li>
          <li>
            今回の審査の主経路はセクション 5 の「予約確定時の作成」です。
          </li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:delete:meeting — Delete a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>予約キャンセル時などに Zoom ミーティングを削除する用途です。</li>
          <li>
            サービス連携の「連携を解除」では、すでに作成済みの Zoom
            ミーティングは削除しません（Zoom 側に残ります）。
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="end-user-flow"
        title="5. エンドユーザー機能（Zoom ミーティング作成）"
      >
        <p className="font-medium text-gray-900">5.1 Google カレンダー連携</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            {SERVICE_NAME} にログインしたままにします。Google
            カレンダー権限は Google ログイン / アカウント設定時に付与されます。
          </li>
          <li>
            <a
              href="https://calendar-app.me/account/integrations"
              className={linkClass}
            >
              サービス連携
            </a>{" "}
            またはカレンダー作成時に Google が連携済みであることを確認します。
          </li>
        </ol>

        <p className="font-medium text-gray-900">5.2 Zoom 連携</p>
        <p>未連携ならセクション 3 を完了します。</p>

        <p className="font-medium text-gray-900">
          5.3 Zoom を使う日程調整カレンダーを作成 / 編集
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            ダッシュボードを開きます:{" "}
            <a href="https://calendar-app.me/dashboard" className={linkClass}>
              https://calendar-app.me/dashboard
            </a>
          </li>
          <li>新規カレンダーを作成するか、既存カレンダーを編集します。</li>
          <li>
            「Web会議」を <strong>Zoom</strong> に設定します。
          </li>
          <li>受付時間（例: 平日 09:00–18:00）を設定して保存します。</li>
          <li>
            公開 URL（slug）をコピーします。例: https://calendar-app.me/&#123;slug&#125;
          </li>
        </ol>

        <p className="font-medium text-gray-900">5.4 ゲストとして予約</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>公開 URL をシークレットウィンドウで開きます。</li>
          <li>空き枠を選択します。</li>
          <li>
            ゲスト名・メール・任意で会社名を入力し、予約を確定します。
          </li>
        </ol>

        <p className="font-medium text-gray-900">5.5 期待結果</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>公開ページに予約完了が表示される</li>
          <li>
            連携済み Zoom アカウントに、予約日時・所要時間のミーティングが作成される
          </li>
          <li>
            Zoom join URL が予約に紐づく（通知や Google
            カレンダー予定の説明にも反映される場合あり）
          </li>
          <li>ホスト側 Google カレンダーに予定が作成される</li>
        </ul>
      </LegalSection>

      <LegalSection id="remove-app" title="6. アプリの削除 / 連携解除">
        <p className="font-medium text-gray-900">{SERVICE_NAME} 側</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <a
              href="https://calendar-app.me/account/integrations"
              className={linkClass}
            >
              https://calendar-app.me/account/integrations
            </a>{" "}
            を開きます。
          </li>
          <li>Zoom の「連携を解除」をクリックして確認します。</li>
        </ol>
        <p>
          期待結果: {SERVICE_NAME} に保存していた Zoom
          トークンが削除されます。再連携するまで新規ミーティングは作成されません。作成済みミーティングは
          Zoom 側に残ります。
        </p>

        <p className="font-medium text-gray-900">Zoom Marketplace 側</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Zoom にログインします。</li>
          <li>
            <a
              href="https://marketplace.zoom.us/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              Zoom App Marketplace
            </a>{" "}
            → Manage → Added Apps を開きます。
          </li>
          <li>
            <strong>{SERVICE_NAME}</strong> を探し、<strong>Remove</strong>{" "}
            をクリックします。
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="troubleshooting" title="7. トラブルシューティング">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            未ログインで Landing URL を開くとログインへ飛ぶ — 仕様です。ログイン後にサービス連携で
            Zoom を接続してください。
          </li>
          <li>
            OAuth に失敗したらサービス連携から再試行。止まっている場合は解除してから再連携してください。
          </li>
          <li>
            予約後に Zoom URL が無い場合は、Zoom
            連携済みであることとカレンダーの Web 会議が Zoom
            であることを確認し、設定を再保存してから別枠で再予約してください。
          </li>
        </ul>
        <p>
          エンドユーザー向けガイド:{" "}
          <Link href="/docs/zoom" className={linkClass}>
            /docs/zoom
          </Link>
        </p>
      </LegalSection>

      <LegalSection id="contact" title="8. お問い合わせ">
        <p>
          開発者連絡先:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            {SUPPORT_EMAIL}
          </a>
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
        This document is the English test plan for Zoom Marketplace reviewers.
        It covers app authorization, each requested scope, and the end-user
        flow for creating Zoom meetings when a booking is confirmed.
      </p>
      <p>
        Related documentation (end-user guide):{" "}
        <Link href="/docs/zoom?lang=en" className={linkClass}>
          https://calendar-app.me/docs/zoom?lang=en
        </Link>
      </p>

      <LegalSection id="overview" title="1. App overview">
        <p>
          <strong>{SERVICE_NAME}</strong> is a scheduling product at{" "}
          <a href="https://calendar-app.me" className={linkClass}>
            https://calendar-app.me
          </a>
          . Hosts connect Google Calendar and optionally Zoom. When a guest
          books a time slot on a public calendar page and the calendar&apos;s
          meeting type is set to Zoom, the app creates a Zoom meeting and
          stores the join URL with the booking.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Production domain:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              https://calendar-app.me
            </code>
          </li>
          <li>
            Direct Landing URL (From your site):{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              https://calendar-app.me/account/integrations
            </code>
          </li>
          <li>
            OAuth redirect URI:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              https://calendar-app.me/api/auth/callback/zoom
            </code>
          </li>
          <li>Account creation: self-service Google sign-up (free)</li>
        </ul>
      </LegalSection>

      <LegalSection id="prerequisites" title="2. Prerequisites for reviewers">
        <ol className="list-decimal pl-5 space-y-2">
          <li>A Zoom account that can authorize Marketplace apps</li>
          <li>A Google account (used to sign in to {SERVICE_NAME})</li>
          <li>
            Ability to open the public booking page in a second browser /
            incognito window (to act as the guest)
          </li>
        </ol>
        <p>
          Test credentials for {SERVICE_NAME} are not required. Reviewers can
          create a free account via Google login at{" "}
          <a href="https://calendar-app.me/signup" className={linkClass}>
            https://calendar-app.me/signup
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="authorization" title="3. App authorization (OAuth)">
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Open{" "}
            <a
              href="https://calendar-app.me/account/integrations"
              className={linkClass}
            >
              https://calendar-app.me/account/integrations
            </a>
            .
          </li>
          <li>
            If you are not signed in, you will be redirected to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /login
            </code>{" "}
            with{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              callbackUrl=/account/integrations
            </code>
            . Sign in with Google, then complete company onboarding if prompted.
          </li>
          <li>
            On the Integrations page, under Zoom, click{" "}
            <strong>Connect with Zoom</strong> / 「Zoom と連携する」.
          </li>
          <li>
            You will be redirected to Zoom&apos;s OAuth consent screen. Review
            the requested scopes and click <strong>Allow</strong>.
          </li>
          <li>
            You should return to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              /account/integrations
            </code>{" "}
            with a success state (Zoom shows as connected / 連携済み).
          </li>
        </ol>
        <p>
          Expected result: Zoom connection tokens are stored for the signed-in
          host user. The app can call Zoom APIs on behalf of that user.
        </p>
      </LegalSection>

      <LegalSection id="scopes" title="4. Scopes and how to verify each">
        <p>The app requests the following granular scopes:</p>

        <p className="font-medium text-gray-900">
          user:read:user — View a user
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Used during OAuth callback to call{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              GET /users/me
            </code>{" "}
            and store the Zoom user id with the connection.
          </li>
          <li>
            Verify: complete authorization (Section 3). Connection succeeds and
            status shows connected.
          </li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:write:meeting — Create a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Used when a guest confirms a booking on a calendar whose meeting
            type is Zoom. The app calls{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              POST /users/me/meetings
            </code>
            .
          </li>
          <li>Verify: follow Section 5 (end-to-end booking test).</li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:read:meeting — View a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Reserved for reading meeting details associated with bookings when
            needed for display / verification of the created meeting.
          </li>
          <li>
            Verify after Section 5: open the created meeting in the Zoom web
            portal / client and confirm topic, time, and join URL match the
            booking.
          </li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:update:meeting — Update a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Intended for updating meeting details when booking information
            changes (e.g. guest / agenda updates tied to the scheduled event).
          </li>
          <li>
            Primary reviewer path for this submission is create-on-booking
            (Section 5).
          </li>
        </ul>

        <p className="font-medium text-gray-900">
          meeting:delete:meeting — Delete a meeting
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Intended for removing Zoom meetings when a booking is cancelled in
            the product.
          </li>
          <li>
            Disconnecting Zoom from Integrations does <strong>not</strong>{" "}
            delete already-created Zoom meetings (they remain in Zoom for the
            host to manage).
          </li>
        </ul>
      </LegalSection>

      <LegalSection
        id="end-user-flow"
        title="5. End-user functionality (create Zoom meeting)"
      >
        <p className="font-medium text-gray-900">5.1 Connect Google Calendar</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Stay signed in to {SERVICE_NAME}. Google Calendar access is granted
            at Google login / account setup.
          </li>
          <li>
            Confirm Google is connected on{" "}
            <a
              href="https://calendar-app.me/account/integrations"
              className={linkClass}
            >
              Integrations
            </a>{" "}
            or when creating a calendar.
          </li>
        </ol>

        <p className="font-medium text-gray-900">5.2 Connect Zoom</p>
        <p>Complete Section 3 if not already connected.</p>

        <p className="font-medium text-gray-900">
          5.3 Create or edit a scheduling calendar with Zoom
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Open the dashboard:{" "}
            <a href="https://calendar-app.me/dashboard" className={linkClass}>
              https://calendar-app.me/dashboard
            </a>
          </li>
          <li>Create a new calendar, or open an existing calendar to edit.</li>
          <li>
            Set <strong>Web conference / 会議</strong> meeting type to{" "}
            <strong>Zoom</strong>.
          </li>
          <li>Set availability (e.g. weekdays 09:00–18:00) and save.</li>
          <li>
            Copy the public calendar URL (slug), e.g.
            https://calendar-app.me/&#123;slug&#125;.
          </li>
        </ol>

        <p className="font-medium text-gray-900">5.4 Book as a guest</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Open the public URL in a private/incognito window.</li>
          <li>Select an available time slot.</li>
          <li>
            Enter guest name, email, and optional company name, then confirm the
            booking.
          </li>
        </ol>

        <p className="font-medium text-gray-900">5.5 Expected results</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Booking confirmation is shown on the public page.</li>
          <li>
            A Zoom meeting is created on the connected Zoom account for the
            booked start time and duration.
          </li>
          <li>
            The Zoom join URL is associated with the booking (and included in
            downstream notifications / calendar event details where applicable).
          </li>
          <li>
            A Google Calendar event is created for the host (Google Calendar
            integration).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="remove-app" title="6. Removing / disconnecting the app">
        <p className="font-medium text-gray-900">From {SERVICE_NAME}</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            Open{" "}
            <a
              href="https://calendar-app.me/account/integrations"
              className={linkClass}
            >
              https://calendar-app.me/account/integrations
            </a>
          </li>
          <li>
            Under Zoom, click <strong>Disconnect</strong> / 「連携を解除」 and
            confirm.
          </li>
        </ol>
        <p>
          Expected result: Zoom tokens stored by {SERVICE_NAME} are deleted.
          New Zoom meetings will no longer be created until the host reconnects.
          Existing Zoom meetings already created remain in Zoom.
        </p>

        <p className="font-medium text-gray-900">From Zoom Marketplace</p>
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
            </a>{" "}
            → Manage → Added Apps.
          </li>
          <li>
            Find <strong>{SERVICE_NAME}</strong> and click{" "}
            <strong>Remove</strong>.
          </li>
        </ol>
      </LegalSection>

      <LegalSection id="troubleshooting" title="7. Troubleshooting">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Landing URL opens login first when logged out — expected. Sign in,
            then use Integrations to connect Zoom.
          </li>
          <li>
            If OAuth fails, retry from Integrations. If stuck, disconnect and
            connect again.
          </li>
          <li>
            If no Zoom URL is created after booking, confirm Zoom is connected
            and the calendar meeting type is Zoom, then save the calendar again
            and retry a new booking.
          </li>
        </ul>
        <p>
          Full end-user guide:{" "}
          <Link href="/docs/zoom?lang=en" className={linkClass}>
            /docs/zoom?lang=en
          </Link>
        </p>
      </LegalSection>

      <LegalSection id="contact" title="8. Contact">
        <p>
          Developer contact:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className={linkClass}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Support hours: Weekdays 10:00–18:00 (Japan Time, excluding holidays)
          </li>
          <li>Initial response target: within 2 business days</li>
        </ul>
      </LegalSection>
    </>
  );
}

export function ZoomTestPlanContent() {
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
    lang === "ja" ? "Zoom連携テストプラン" : "Zoom Integration Test Plan";
  const description =
    lang === "ja"
      ? `Zoom Marketplace 審査向けに、${SERVICE_NAME} の認可・スコープ・予約時ミーティング作成を確認する手順です。`
      : `Step-by-step guide for Zoom Marketplace reviewers to test ${SERVICE_NAME} (Aporaku Scheduling).`;

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
