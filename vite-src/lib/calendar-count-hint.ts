export const CALENDAR_COUNT_HINT_KEY = "schedule.calendarCount";

export function readCalendarCountHint(): number | null {
  try {
    const raw = sessionStorage.getItem(CALENDAR_COUNT_HINT_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
  } catch {
    return null;
  }
}

export function writeCalendarCountHint(count: number) {
  try {
    sessionStorage.setItem(CALENDAR_COUNT_HINT_KEY, String(Math.max(0, count)));
  } catch {
    // ignore
  }
}
