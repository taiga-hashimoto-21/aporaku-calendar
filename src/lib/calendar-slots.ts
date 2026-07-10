import { generateDaySlots, filterBusySlots, formatDateKey } from "@/lib/availability";
import { getGoogleBusyIntervals } from "@/lib/google-calendar";
import { addDaysToDateKey, parseDateKey } from "@/lib/booking-timezone";
import type { CalendarWithOwner } from "@/lib/delivery-link";
import type { DateOverride, WeeklyAvailability } from "@/types/calendar";

export async function getAvailableSlotsForCalendar(
  calendar: CalendarWithOwner,
  targetDate: Date
): Promise<Array<{ start: Date; end: Date }>> {
  const byDate = await getAvailableSlotsForDateRange(calendar, targetDate, 1);
  const dateKey = formatDateKey(targetDate, calendar.timezone);
  return byDate[dateKey] ?? [];
}

export async function getAvailableSlotsForDateRange(
  calendar: CalendarWithOwner,
  fromDate: Date,
  days: number
): Promise<Record<string, Array<{ start: Date; end: Date }>>> {
  const weeklyAvailability = calendar.weeklyAvailability as unknown as WeeklyAvailability;
  const dateOverrides = (calendar.dateOverrides as unknown as DateOverride[]) ?? [];
  const timezone = calendar.timezone;

  const fromKey = formatDateKey(fromDate, timezone);
  const slotsByDate: Record<string, Array<{ start: Date; end: Date }>> = {};
  const allSlots: Array<{ start: Date; end: Date }> = [];

  for (let i = 0; i < days; i++) {
    const dateKey = addDaysToDateKey(fromKey, i, timezone);
    const date = parseDateKey(dateKey, timezone);
    const daySlots = generateDaySlots({
      date,
      timezone,
      weeklyAvailability,
      dateOverrides,
      durationMinutes: calendar.durationMinutes,
      bufferBeforeMinutes: calendar.bufferBeforeMinutes,
      bufferAfterMinutes: calendar.bufferAfterMinutes,
      minNoticeHours: calendar.minNoticeHours,
      bookingWindowDays: calendar.bookingWindowDays,
    });
    slotsByDate[dateKey] = daySlots;
    allSlots.push(...daySlots);
  }

  if (allSlots.length === 0) {
    return slotsByDate;
  }

  try {
    const busy = await getGoogleBusyIntervals({
      userId: calendar.user.id,
      timeMin: allSlots[0].start,
      timeMax: allSlots[allSlots.length - 1].end,
    });

    for (const dateKey of Object.keys(slotsByDate)) {
      slotsByDate[dateKey] = filterBusySlots(
        slotsByDate[dateKey],
        busy,
        calendar.bufferBeforeMinutes,
        calendar.bufferAfterMinutes
      );
    }
  } catch (err) {
    console.warn("Google Calendar busy lookup failed:", err);
  }

  return slotsByDate;
}

export function serializePublicCalendarResponse(
  calendar: CalendarWithOwner,
  slotsByDate: Record<string, Array<{ start: Date; end: Date }>>,
  extra?: {
    linkKind?: "calendar" | "delivery";
    deliveryLinkSlug?: string;
    companyName?: string | null;
    from?: string;
    days?: number;
  }
) {
  const serializedByDate: Record<string, Array<{ start: string; end: string }>> = {};
  for (const [dateKey, daySlots] of Object.entries(slotsByDate)) {
    serializedByDate[dateKey] = daySlots.map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
    }));
  }

  const flatSlots = Object.values(serializedByDate).flat();

  return {
    calendar: {
      id: calendar.id,
      slug: calendar.slug,
      name: calendar.name,
      description: calendar.description,
      durationMinutes: calendar.durationMinutes,
      timezone: calendar.timezone,
      meetingType: calendar.meetingType,
      bookingWindowDays: calendar.bookingWindowDays,
      ownerName: calendar.user.name ?? calendar.user.email,
      ownerImage: calendar.user.image,
    },
    from: extra?.from ?? null,
    days: extra?.days ?? null,
    linkKind: extra?.linkKind ?? "calendar",
    deliveryLinkSlug: extra?.deliveryLinkSlug ?? null,
    prefilledCompany:
      extra?.linkKind === "delivery" && extra?.companyName ? extra.companyName : null,
    customFields: calendar.customFields.map((f) => ({
      id: f.id,
      label: f.label,
      fieldType: f.fieldType,
      required: f.required,
      options: f.options as string[] | null,
      sortOrder: f.sortOrder,
    })),
    slotsByDate: serializedByDate,
    slots: flatSlots,
  };
}
