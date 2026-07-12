"use client";

import { Link } from "react-router-dom";
import { CalendarShareLink } from "@/components/calendar-share-link";

type CalendarListItem = {
  id: string;
  name: string;
  publicUrl: string;
  durationMinutes: number;
  meetingType: string;
  isActive: boolean;
};

function formatMeetingTypeLabel(meetingType: string): string {
  switch (meetingType) {
    case "google_meet":
      return "Google Meet";
    case "zoom":
      return "Zoom";
    case "none":
    default:
      return "リンクなし";
  }
}

function formatCalendarMeta(cal: CalendarListItem): string {
  const parts = [
    `${cal.durationMinutes}分`,
    formatMeetingTypeLabel(cal.meetingType),
  ];
  if (!cal.isActive) {
    parts.push("非公開");
  }
  return parts.join(" / ");
}

export function DashboardCalendarList({ calendars }: { calendars: CalendarListItem[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {calendars.map((cal) => (
        <li key={cal.id} className="flex items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-900">{cal.name}</p>
            <CalendarShareLink url={cal.publicUrl} variant="compact" />
            <p className="text-xs text-gray-500">{formatCalendarMeta(cal)}</p>
          </div>
          <Link
            to={`/calendars/${cal.id}/edit`}
            className="shrink-0 cursor-pointer text-sm text-primary hover:underline"
          >
            編集
          </Link>
        </li>
      ))}
    </ul>
  );
}
