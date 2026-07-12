import { PublicBookingPage, type InitialBookingData } from "@/components/public-booking-page";
import { resolvePublicSlug } from "@/lib/delivery-link";
import { serializePublicCalendarResponse } from "@/lib/calendar-slots";
import { getPublicSlots } from "@/lib/slots-cache";
import { getMonthGrid, parseDateKey } from "@/lib/booking-timezone";
import { isReservedSlug } from "@/lib/utils";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { notFound } from "next/navigation";
import { cache } from "react";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

// generateMetadata と page で slug 解決 (DB) を共有し、リクエスト内で 1 回にする
const getResolved = cache((slug: string) => resolvePublicSlug(slug));

function getJstDayFaviconPath(date = new Date()): string {
  const day = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      day: "numeric",
    }).format(date)
  );
  const safeDay = Number.isFinite(day) && day >= 1 && day <= 31 ? day : 1;
  return `/favicons/${safeDay}.ico`;
}

/** 今月 (Asia/Tokyo 基準) の月グリッド範囲。 クライアント初期表示と同じ計算。 */
function currentMonthGridRange(timezone: string): { from: string; days: number } | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;

  const cells = getMonthGrid(year, month);
  const from = cells[0]?.dateKey;
  const to = cells[cells.length - 1]?.dateKey;
  if (!from || !to) return null;

  const fromDate = parseDateKey(from, timezone);
  const toDate = parseDateKey(to, timezone);
  const days = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  return { from, days };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const icons = { icon: getJstDayFaviconPath() };

  if (isReservedSlug(slug)) {
    return { icons };
  }

  const resolved = await getResolved(slug);
  if (!resolved) {
    return { icons };
  }

  const name =
    resolved.calendar.user.name?.trim() ||
    resolved.calendar.user.email.split("@")[0] ||
    "担当者";
  const duration = resolved.calendar.durationMinutes;

  return {
    title: `${name} と ${duration} 分間の予定`,
    icons,
  };
}

export default async function PublicCalendarRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isReservedSlug(slug)) {
    notFound();
  }

  const resolved = await getResolved(slug);
  if (!resolved) {
    notFound();
  }

  // 今月分の空き枠を SSR で埋め込む (キャッシュヒット時は Google API 0回)。
  // 失敗しても initialData なしで描画し、クライアント側の従来 fetch にフォールバックする。
  let initialData: InitialBookingData | null = null;
  try {
    const range = currentMonthGridRange(resolved.calendar.timezone);
    if (range) {
      const slotsByDate = await getPublicSlots(resolved.calendar, range.from, range.days);
      const payload = serializePublicCalendarResponse(resolved.calendar, slotsByDate, {
        linkKind: resolved.kind,
        deliveryLinkSlug: resolved.deliveryLink?.slug,
        companyName: resolved.deliveryLink?.companyName,
        from: range.from,
        days: range.days,
      });
      initialData = {
        calendar: payload.calendar,
        slotsByDate: payload.slotsByDate,
        prefilledCompany: payload.prefilledCompany,
        from: payload.from,
        days: payload.days,
      };
    }
  } catch (err) {
    console.warn("SSR slots preload failed (falling back to client fetch):", err);
  }

  return (
    <main
      className={`${roboto.variable} font-public-booking min-h-screen w-full bg-white px-4 pt-3 pb-6 sm:px-8 sm:pt-6 sm:pb-10`}
    >
      <PublicBookingPage slug={slug} initialData={initialData} />
    </main>
  );
}
