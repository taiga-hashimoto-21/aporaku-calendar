export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimeSlot {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export type WeeklyAvailability = Record<DayOfWeek, TimeSlot[]>;

export interface DateOverride {
  date: string; // "YYYY-MM-DD"
  slots: TimeSlot[];
  /** true の場合、その日は受付停止 */
  closed?: boolean;
}

export interface AvailableSlot {
  start: Date;
  end: Date;
}

export interface CalendarPublicInfo {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  timezone: string;
  meetingType: "none" | "zoom" | "google_meet";
  ownerName: string | null;
}

export interface CustomFieldPublic {
  id: string;
  label: string;
  fieldType: "text" | "textarea" | "select";
  required: boolean;
  options: string[] | null;
  sortOrder: number;
}

export interface BookingFormData {
  startAt: string; // ISO 8601
  guestName: string;
  guestEmail: string;
  guestCompany?: string;
  answers?: Array<{ fieldId?: string; label: string; value: string }>;
}
