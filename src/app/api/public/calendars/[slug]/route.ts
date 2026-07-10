import { NextRequest, NextResponse } from "next/server";
import { parseDateKey, todayDateKey } from "@/lib/booking-timezone";
import { resolvePublicSlug } from "@/lib/delivery-link";
import {
  getAvailableSlotsForDateRange,
  serializePublicCalendarResponse,
} from "@/lib/calendar-slots";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const fromParam = request.nextUrl.searchParams.get("from");
  const daysParam = request.nextUrl.searchParams.get("days");

  const resolved = await resolvePublicSlug(slug, { recordClick: true });
  if (!resolved) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const timezone = resolved.calendar.timezone;
  const days = Math.min(Math.max(Number(daysParam ?? "7") || 7, 1), 31);

  let fromKey: string;
  if (fromParam) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fromParam)) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    fromKey = fromParam;
  } else {
    fromKey = todayDateKey(timezone);
  }

  const fromDate = parseDateKey(fromKey, timezone);
  if (Number.isNaN(fromDate.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const slotsByDate = await getAvailableSlotsForDateRange(resolved.calendar, fromDate, days);

  return NextResponse.json(
    serializePublicCalendarResponse(resolved.calendar, slotsByDate, {
      linkKind: resolved.kind,
      deliveryLinkSlug: resolved.deliveryLink?.slug,
      companyName: resolved.deliveryLink?.companyName,
      from: fromKey,
      days,
    })
  );
}
