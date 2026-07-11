import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AccountSettingsSection,
  StatusBadge,
} from "@/components/account-settings-section";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type IntegrationsResponse = {
  googleConnected: boolean;
  googleEmail: string | null;
  googleCalendarId: string;
  zoomConnected: boolean;
  aporakuUserId: string | null;
};

type CalendarItem = {
  id: string;
  name: string;
  publicUrl: string;
  durationMinutes: number;
  meetingType: string;
  isActive: boolean;
};

function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded shimmer" />
      <div className="rounded-lg bg-white p-6 space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-32 rounded shimmer" />
          <div className="h-4 w-full max-w-lg rounded shimmer" />
          <div className="h-5 w-20 rounded-full shimmer" />
        </div>
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="h-4 w-40 rounded shimmer" />
          <div className="h-16 w-full rounded-lg shimmer" />
        </div>
      </div>
    </div>
  );
}

export function AccountCalendarPage() {
  const { teamVersion } = useAuth();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationsResponse | null>(null);
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [integrationsData, calendarsData] = await Promise.all([
        api<IntegrationsResponse>("/api/account/integrations"),
        api<{ calendars: CalendarItem[] }>("/api/calendars"),
      ]);
      setIntegrations(integrationsData);
      setCalendars(calendarsData.calendars ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "連携情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, teamVersion]);

  if (loading || !integrations) {
    return <PageLoading />;
  }

  return (
    <AccountSettingsSection title="連携カレンダー">
      <div className="space-y-8">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Google カレンダー</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            ログイン時に連携した Google アカウントのカレンダーを参照し、空き時間の取得と予定登録に使用します。
          </p>
          <div className="flex items-center gap-2">
            <StatusBadge connected={integrations.googleConnected} />
            {integrations.googleConnected && integrations.googleEmail && (
              <span className="text-xs text-gray-500">{integrations.googleEmail}</span>
            )}
          </div>
          {integrations.googleConnected && (
            <label className="block space-y-1 max-w-md">
              <span className="text-sm text-gray-700">連携中のカレンダー ID</span>
              <input
                type="text"
                readOnly
                value={integrations.googleCalendarId}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-gray-600 font-mono"
              />
            </label>
          )}
          {!integrations.googleConnected && (
            <p className="text-sm text-gray-500">
              Google アカウントでログインすると自動的に連携されます。
            </p>
          )}
        </section>

        <section className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-medium text-gray-900">日程調整カレンダー</h3>
            <Link
              to="/calendars/new"
              className="text-sm text-primary hover:underline font-medium"
            >
              新規作成
            </Link>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            公開予約ページとして共有する日程調整カレンダー一覧です。
          </p>

          {calendars.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center border border-dashed border-border rounded-lg">
              カレンダーがありません。
            </p>
          ) : (
            <ul className="divide-y divide-border border border-border rounded-lg">
              {calendars.map((cal) => (
                <li
                  key={cal.id}
                  className="px-4 py-4 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{cal.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{cal.publicUrl}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {cal.durationMinutes}分 ·{" "}
                      {cal.meetingType === "none" ? "対面/なし" : cal.meetingType}
                      {!cal.isActive && " · 非公開"}
                    </p>
                  </div>
                  <Link
                    to={`/calendars/${cal.id}/edit`}
                    className="shrink-0 text-sm text-primary hover:underline"
                  >
                    編集
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AccountSettingsSection>
  );
}
