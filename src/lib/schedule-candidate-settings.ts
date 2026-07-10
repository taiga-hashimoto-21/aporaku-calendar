import type { DateOverride, DayOfWeek, TimeSlot, WeeklyAvailability } from "@/types/calendar";

export const CREATE_DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailability = {
  sunday: [],
  monday: [{ start: "10:00", end: "19:00" }],
  tuesday: [{ start: "10:00", end: "19:00" }],
  wednesday: [{ start: "10:00", end: "19:00" }],
  thursday: [{ start: "10:00", end: "19:00" }],
  friday: [{ start: "10:00", end: "19:00" }],
  saturday: [],
};

export type PresetMode = "preset" | "custom";

export const MIN_NOTICE_OPTIONS = [
  { value: 12, label: "12 時間後" },
  { value: 18, label: "18 時間後" },
  { value: 24, label: "24 時間後" },
  { value: 48, label: "48 時間後" },
] as const;

export type ScheduleCandidateSettingsValue = {
  weeklyAvailability: WeeklyAvailability;
  timezone: string;
  acceptHolidayBookings: boolean;
  minNoticeHours: number;
  minNoticeMode: PresetMode;
};

export const DEFAULT_SCHEDULE_CANDIDATE_SETTINGS: ScheduleCandidateSettingsValue = {
  weeklyAvailability: CREATE_DEFAULT_WEEKLY_AVAILABILITY,
  timezone: "Asia/Tokyo",
  acceptHolidayBookings: false,
  minNoticeHours: 12,
  minNoticeMode: "preset",
};

export const WEEKDAY_OPTIONS: Array<{ key: DayOfWeek; label: string }> = [
  { key: "sunday", label: "日曜日" },
  { key: "monday", label: "月曜日" },
  { key: "tuesday", label: "火曜日" },
  { key: "wednesday", label: "水曜日" },
  { key: "thursday", label: "木曜日" },
  { key: "friday", label: "金曜日" },
  { key: "saturday", label: "土曜日" },
];

export const WEEKDAY_SHORT_OPTIONS: Array<{ key: DayOfWeek; label: string }> = [
  { key: "sunday", label: "日" },
  { key: "monday", label: "月" },
  { key: "tuesday", label: "火" },
  { key: "wednesday", label: "水" },
  { key: "thursday", label: "木" },
  { key: "friday", label: "金" },
  { key: "saturday", label: "土" },
];

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Tokyo", label: "アジア/東京(UTC+09:00)" },
] as const;

export function formatWeeklySlotLabel(slots: TimeSlot[]): string {
  if (slots.length === 0) return "受付なし";
  const slot = slots[0];
  return `${slot.start} - ${slot.end}`;
}

export function resolveScheduleCandidateSettings(
  value: ScheduleCandidateSettingsValue
): Pick<
  ScheduleCandidateSettingsValue,
  "weeklyAvailability" | "timezone" | "acceptHolidayBookings" | "minNoticeHours"
> & { bookingWindowDays: number; dateOverrides: DateOverride[] } {
  return {
    weeklyAvailability: value.weeklyAvailability,
    timezone: value.timezone,
    acceptHolidayBookings: value.acceptHolidayBookings,
    dateOverrides: [],
    minNoticeHours: value.minNoticeHours,
    bookingWindowDays: 60,
  };
}
