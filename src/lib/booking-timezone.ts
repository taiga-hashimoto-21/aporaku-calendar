/** 公開予約ページ用の日付ユーティリティ（Phase 1: Asia/Tokyo 中心） */

export function formatDateKey(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function parseDateKey(dateKey: string, timezone: string): Date {
  if (timezone === "Asia/Tokyo") {
    return new Date(`${dateKey}T00:00:00+09:00`);
  }
  return new Date(`${dateKey}T00:00:00`);
}

export function addDaysToDateKey(dateKey: string, days: number, timezone: string): string {
  const base = parseDateKey(dateKey, timezone);
  base.setUTCDate(base.getUTCDate() + days);
  return formatDateKey(base, timezone);
}

export function todayDateKey(timezone: string): string {
  return formatDateKey(new Date(), timezone);
}

export type MonthGridCell = {
  dateKey: string;
  day: number;
  inCurrentMonth: boolean;
};

export function getMonthGrid(year: number, month: number): MonthGridCell[] {
  const startWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();

  const cells: MonthGridCell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      dateKey: formatDateKeyParts(prevYear, prevMonth, day),
      day,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      dateKey: formatDateKeyParts(year, month, day),
      day,
      inCurrentMonth: true,
    });
  }

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  let nextDay = 1;

  while (cells.length < 42) {
    cells.push({
      dateKey: formatDateKeyParts(nextYear, nextMonth, nextDay),
      day: nextDay,
      inCurrentMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}

function formatDateKeyParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatTimezoneLabel(timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("ja-JP", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    }).formatToParts(new Date());
    const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
    const name = new Intl.DateTimeFormat("ja-JP", {
      timeZone: timezone,
      timeZoneName: "longGeneric",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;

    if (offset && name) {
      return `(${offset}) ${name}`;
    }
  } catch {
    // fall through
  }

  return timezone;
}

export function formatTime(iso: string, timezone: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
  });
}
