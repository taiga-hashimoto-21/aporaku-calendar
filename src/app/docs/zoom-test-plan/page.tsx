import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing-chrome";
import { SERVICE_NAME, SUPPORT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Zoom Integration Test Plan | ${SERVICE_NAME}`,
  description: `English test plan for Zoom Marketplace reviewers — authorization, scopes, and end-user functionality for ${SERVICE_NAME}`,
  robots: { index: false, follow: false },
};

const linkClass =
  "text-primary underline underline-offset-2 hover:opacity-80";

export default function ZoomTestPlanPage() {
  return (
    <LegalPageShell
      title="Zoom Integration Test Plan"
      description={`Step-by-step guide for Zoom Marketplace reviewers to test ${SERVICE_NAME} (Aporaku Scheduling).`}
    >
      <p>
        This document is the English test plan for Zoom reviewers. It covers
        app authorization, each requested scope, and the end-user flow for
        creating Zoom meetings when a booking is confirmed.
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
            Disconnecting Zoom from Integrations does{" "}
            <strong>not</strong> delete already-created Zoom meetings (they
            remain in Zoom for the host to manage).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="end-user-flow" title="5. End-user functionality (create Zoom meeting)">
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
          <li>Copy the public calendar URL (slug), e.g. https://calendar-app.me/&#123;slug&#125;.</li>
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
            Find <strong>{SERVICE_NAME}</strong> and click <strong>Remove</strong>.
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
          <li>Support hours: Weekdays 10:00–18:00 (Japan Time, excluding holidays)</li>
          <li>Initial response target: within 2 business days</li>
        </ul>
      </LegalSection>
    </LegalPageShell>
  );
}
