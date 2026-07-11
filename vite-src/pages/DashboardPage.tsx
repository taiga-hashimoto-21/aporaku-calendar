import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { DashboardCalendarList } from "@/components/dashboard-calendar-list";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type CalendarItem = {
  id: string;
  name: string;
  publicUrl: string;
  durationMinutes: number;
  meetingType: string;
  isActive: boolean;
};

function CalendarEmptyState() {
  return (
    <div className="py-10 flex flex-col items-center gap-4 text-center">
      <p className="text-sm text-gray-600">
        日程調整カレンダーがまだありません。
        <br />
        最初のカレンダーを作成してください。
      </p>
      <Link
        to="/calendars/new"
        className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
      >
        カレンダーを作成
      </Link>
    </div>
  );
}

function CalendarListRowSkeleton() {
  return (
    <li className="flex items-start justify-between gap-4 px-4 py-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-5 w-40 max-w-full rounded shimmer" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-4 w-56 max-w-[70%] rounded shimmer" />
          <span className="shrink-0 text-xs font-medium text-gray-600">コピー</span>
        </div>
        <div className="h-3 w-28 rounded shimmer" />
      </div>
      <span className="shrink-0 text-sm text-primary">編集</span>
    </li>
  );
}

function CalendarListSkeleton({ count }: { count: number }) {
  const rows = Math.max(count, 1);
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
      {Array.from({ length: rows }, (_, i) => (
        <CalendarListRowSkeleton key={i} />
      ))}
    </ul>
  );
}

export function DashboardPage() {
  const { calendarCount, teamVersion, setCalendarCount } = useAuth();
  const [loading, setLoading] = useState(calendarCount > 0);
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (expectedCount: number) => {
      const requestId = ++requestIdRef.current;

      if (expectedCount === 0) {
        // session 時点の件数で空UIを即表示（見た目は最終形）
        setCalendars([]);
        setLoading(false);
        // 作成直後などのズレ吸収のため裏で一覧だけ同期
        try {
          const data = await api<{ calendars: CalendarItem[] }>("/api/calendars");
          if (requestId !== requestIdRef.current) return;
          const next = data.calendars ?? [];
          if (next.length > 0) {
            setCalendars(next);
            setCalendarCount(next.length);
          }
        } catch {
          // 空表示のまま（裏同期失敗は握りつぶす）
        }
        return;
      }

      setLoading(true);
      setCalendars([]);
      try {
        const data = await api<{ calendars: CalendarItem[] }>("/api/calendars");
        if (requestId !== requestIdRef.current) return;
        const next = data.calendars ?? [];
        setCalendars(next);
        setCalendarCount(next.length);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        toast.error(err instanceof Error ? err.message : "カレンダーの取得に失敗しました");
        setCalendars([]);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [setCalendarCount]
  );

  useEffect(() => {
    void load(calendarCount);
  }, [load, calendarCount, teamVersion]);

  const showListChrome = calendarCount > 0 || calendars.length > 0;
  const showSkeleton = loading && calendarCount > 0;
  const showList = !loading && calendars.length > 0;

  return (
    <AccountSettingsSection
      title="カレンダー"
      action={
        showListChrome ? (
          <Link
            to="/calendars/new"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            カレンダーを追加
          </Link>
        ) : undefined
      }
    >
      {showSkeleton ? (
        <CalendarListSkeleton count={calendarCount} />
      ) : showList ? (
        <DashboardCalendarList calendars={calendars} />
      ) : (
        <CalendarEmptyState />
      )}
    </AccountSettingsSection>
  );
}
