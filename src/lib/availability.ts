import type { DateOverride, DayOfWeek, TimeSlot, WeeklyAvailability } from "@/types/calendar";

const DAY_INDEX_TO_KEY: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function formatDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getDayOfWeek(date: Date, timezone: string): DayOfWeek {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  })
    .format(date)
    .toLowerCase() as DayOfWeek;
  return weekday;
}

function getSlotsForDate(
  date: Date,
  timezone: string,
  weeklyAvailability: WeeklyAvailability,
  dateOverrides: DateOverride[]
): TimeSlot[] | null {
  const dateKey = formatDateKey(date, timezone);
  const override = dateOverrides.find((o) => o.date === dateKey);

  if (override) {
    if (override.closed) return null;
    return override.slots;
  }

  const dayKey = getDayOfWeek(date, timezone);
  return weeklyAvailability[dayKey] ?? [];
}

/**
 * 受付設定から日次スロット候補を生成する（Google カレンダーとの重複チェック前）
 */
export function generateDaySlots(params: {
  date: Date;
  timezone: string;
  weeklyAvailability: WeeklyAvailability;
  dateOverrides: DateOverride[];
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  minNoticeHours: number;
  bookingWindowDays: number;
  now?: Date;
}): Array<{ start: Date; end: Date }> {
  const now = params.now ?? new Date();
  const slots: Array<{ start: Date; end: Date }> = [];

  const dateKey = formatDateKey(params.date, params.timezone);
  const todayKey = formatDateKey(now, params.timezone);
  const windowEndDate = new Date(now);
  windowEndDate.setDate(windowEndDate.getDate() + params.bookingWindowDays);
  const windowEndKey = formatDateKey(windowEndDate, params.timezone);

  if (dateKey < todayKey || dateKey > windowEndKey) {
    return slots;
  }

  const daySlots = getSlotsForDate(
    params.date,
    params.timezone,
    params.weeklyAvailability,
    params.dateOverrides
  );

  if (!daySlots || daySlots.length === 0) {
    return slots;
  }

  const totalBlock =
    params.durationMinutes + params.bufferBeforeMinutes + params.bufferAfterMinutes;
  const minStart = new Date(now.getTime() + params.minNoticeHours * 60 * 60 * 1000);

  for (const range of daySlots) {
    const rangeStart = parseTimeToMinutes(range.start);
    const rangeEnd = parseTimeToMinutes(range.end);

    for (
      let cursor = rangeStart + params.bufferBeforeMinutes;
      cursor + params.durationMinutes + params.bufferAfterMinutes <= rangeEnd;
      cursor += params.durationMinutes + params.bufferAfterMinutes
    ) {
      const startMinutes = cursor;
      const endMinutes = cursor + params.durationMinutes;

      const start = buildDateInTimezone(params.date, startMinutes, params.timezone);
      const end = buildDateInTimezone(params.date, endMinutes, params.timezone);

      if (start >= minStart) {
        slots.push({ start, end });
      }
    }
  }

  return slots;
}

/**
 * タイムゾーン上の日付 + 分オフセットから UTC Date を構築する簡易版。
 * Phase 1 では Asia/Tokyo 固定運用を想定。本番前に luxon/date-fns-tz へ移行予定。
 */
function buildDateInTimezone(baseDate: Date, minutesFromMidnight: number, timezone: string): Date {
  const dateKey = formatDateKey(baseDate, timezone);
  const h = Math.floor(minutesFromMidnight / 60);
  const m = minutesFromMidnight % 60;
  const localIso = `${dateKey}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;

  // JST 固定オフセット（Phase 1）。他 TZ 対応は後続。
  if (timezone === "Asia/Tokyo") {
    return new Date(`${localIso}+09:00`);
  }

  return new Date(localIso);
}

/** Google FreeBusy の busy 区間と重複するスロットを除外 */
export function filterBusySlots(
  slots: Array<{ start: Date; end: Date }>,
  busyIntervals: Array<{ start: Date; end: Date }>,
  bufferBeforeMinutes: number,
  bufferAfterMinutes: number
): Array<{ start: Date; end: Date }> {
  return slots.filter((slot) => {
    const slotStart = new Date(slot.start.getTime() - bufferBeforeMinutes * 60 * 1000);
    const slotEnd = new Date(slot.end.getTime() + bufferAfterMinutes * 60 * 1000);

    return !busyIntervals.some(
      (busy) => slotStart < busy.end && slotEnd > busy.start
    );
  });
}

export { DAY_INDEX_TO_KEY, formatDateKey, getDayOfWeek };
