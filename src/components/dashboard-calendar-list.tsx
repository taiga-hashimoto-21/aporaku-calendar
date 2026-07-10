"use client";

import Link from "next/link";
import { CalendarShareLink } from "@/components/calendar-share-link";

type CalendarListItem = {
  id: string;
  name: string;
  publicUrl: string;
  durationMinutes: number;
  meetingType: string;
  isActive: boolean;
};

export function DashboardCalendarList({ calendars }: { calendars: CalendarListItem[] }) {
  return (
    <div className="space-y-6">
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {calendars.map((cal) => (
          <li key={cal.id} className="flex items-start justify-between gap-4 px-4 py-4">
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-medium text-gray-900">{cal.name}</p>
              <CalendarShareLink url={cal.publicUrl} variant="compact" />
              <p className="text-xs text-gray-400">
                {cal.durationMinutes}分 ·{" "}
                {cal.meetingType === "none" ? "対面/なし" : cal.meetingType}
                {!cal.isActive && " · 非公開"}
              </p>
            </div>
            <Link
              href={`/calendars/${cal.id}/edit`}
              className="shrink-0 text-sm text-primary hover:underline"
            >
              編集
            </Link>
          </li>
        ))}
      </ul>

      <div className="flex justify-center pt-2">
        <Link
          href="/calendars/new"
          className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
        >
          カレンダーを作成
        </Link>
      </div>
    </div>
  );
}
