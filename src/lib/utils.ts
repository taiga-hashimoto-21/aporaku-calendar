import type { WeeklyAvailability } from "@/types/calendar";

/** デフォルトの受付時間帯（平日 9:00–18:00） */
export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailability = {
  monday: [{ start: "09:00", end: "18:00" }],
  tuesday: [{ start: "09:00", end: "18:00" }],
  wednesday: [{ start: "09:00", end: "18:00" }],
  thursday: [{ start: "09:00", end: "18:00" }],
  friday: [{ start: "09:00", end: "18:00" }],
  saturday: [],
  sunday: [],
};

/** ルートパスと衝突しないよう予約するスラッグ */
export const RESERVED_SLUGS = new Set([
  "login",
  "signup",
  "dashboard",
  "calendars",
  "settings",
  "account",
  "api",
  "s",
  "_next",
  "favicon.ico",
]);

/** 内部用の短い slug */
export function generateSlug(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

/** メールアドレスから teamSlug を生成（内部管理用・公開 URL には不使用） */
export function emailToTeamSlug(email: string): string {
  const local = email.split("@")[0] ?? "user";
  return (
    local
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || generateSlug()
  );
}

/** 公開予約ページの URL を生成 */
export function buildPublicCalendarUrl(slug: string, baseUrl?: string): string {
  const base = (
    baseUrl ??
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3002"
  ).replace(/\/$/, "");
  return `${base}/${slug}`;
}
