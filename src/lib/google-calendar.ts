import { prisma } from "@/lib/prisma";
import { google } from "googleapis";
import type { SchedulingCalendar, Booking } from "@prisma/client";

/**
 * Google OAuth トークン取得。
 * Phase 1: Account テーブル（Auth.js）の refresh_token を使用。
 * 後続: GoogleConnection テーブルへの移行・暗号化対応。
 */
async function getOAuthClient(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });
  if (!account?.refresh_token) {
    throw new Error("Google account not connected");
  }

  const oauth2 = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2.setCredentials({
    refresh_token: account.refresh_token,
    access_token: account.access_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  return oauth2;
}

export async function getGoogleBusyIntervals(params: {
  userId: string;
  timeMin: Date;
  timeMax: Date;
  /** 事前読込済みの Google 認証情報。 渡すと DB 往復 (Account/GoogleConnection) を省略する。 */
  preloadedAuth?: {
    account: {
      refresh_token: string | null;
      access_token: string | null;
      expires_at: number | null;
    } | null;
    calendarId: string | null;
  };
}): Promise<Array<{ start: Date; end: Date }>> {
  let auth: InstanceType<typeof google.auth.OAuth2>;
  let calendarId: string;
  if (params.preloadedAuth) {
    const account = params.preloadedAuth.account;
    if (!account?.refresh_token) {
      throw new Error("Google account not connected");
    }
    auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials({
      refresh_token: account.refresh_token,
      access_token: account.access_token ?? undefined,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    });
    calendarId = params.preloadedAuth.calendarId ?? "primary";
  } else {
    auth = await getOAuthClient(params.userId);
    const connection = await prisma.googleConnection.findUnique({
      where: { userId: params.userId },
    });
    calendarId = connection?.calendarId ?? "primary";
  }
  const calendar = google.calendar({ version: "v3", auth });

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: params.timeMin.toISOString(),
      timeMax: params.timeMax.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  const busy = res.data.calendars?.[calendarId]?.busy ?? [];
  return busy
    .filter((b) => b.start && b.end)
    .map((b) => ({
      start: new Date(b.start!),
      end: new Date(b.end!),
    }));
}

export async function createGoogleCalendarEvent(params: {
  userId: string;
  calendar: SchedulingCalendar;
  booking: Booking;
  guestName: string;
  guestEmail: string;
}): Promise<{ eventId: string; meetUrl?: string } | null> {
  const auth = await getOAuthClient(params.userId);
  const gcal = google.calendar({ version: "v3", auth });

  const connection = await prisma.googleConnection.findUnique({
    where: { userId: params.userId },
  });
  const calendarId = connection?.calendarId ?? "primary";

  const requestBody: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    attendees: Array<{ email: string; displayName?: string }>;
    conferenceData?: {
      createRequest: {
        requestId: string;
        conferenceSolutionKey: { type: string };
      };
    };
  } = {
    summary: `${params.calendar.name} - ${params.guestName}`,
    description: params.booking.guestCompany
      ? `会社: ${params.booking.guestCompany}`
      : undefined,
    start: {
      dateTime: params.booking.startAt.toISOString(),
      timeZone: params.calendar.timezone,
    },
    end: {
      dateTime: params.booking.endAt.toISOString(),
      timeZone: params.calendar.timezone,
    },
    attendees: [{ email: params.guestEmail, displayName: params.guestName }],
  };

  if (params.calendar.meetingType === "google_meet") {
    requestBody.conferenceData = {
      createRequest: {
        requestId: params.booking.id,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    };
  }

  const res = await gcal.events.insert({
    calendarId,
    conferenceDataVersion: params.calendar.meetingType === "google_meet" ? 1 : 0,
    sendUpdates: "all",
    requestBody,
  });

  const meetUrl =
    res.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === "video")
      ?.uri ?? undefined;

  return {
    eventId: res.data.id ?? "",
    meetUrl,
  };
}
