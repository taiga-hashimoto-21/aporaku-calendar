import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCurrentTeam } from "@/lib/team";
import { buildPublicCalendarUrl } from "@/lib/utils";
import {
  AccountSettingsSection,
  StatusBadge,
} from "@/components/account-settings-section";

export default async function AccountCalendarPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currentTeam = await ensureCurrentTeam(session.user.id);

  const [googleAccount, googleConnection, calendars] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
      select: { providerAccountId: true },
    }),
    prisma.googleConnection.findUnique({
      where: { userId: session.user.id },
      select: { calendarId: true },
    }),
    prisma.schedulingCalendar.findMany({
      where: { teamId: currentTeam.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        durationMinutes: true,
        meetingType: true,
        isActive: true,
      },
    }),
  ]);

  const googleConnected = Boolean(googleAccount);
  const calendarId = googleConnection?.calendarId ?? "primary";

  return (
    <AccountSettingsSection title="連携カレンダー">
      <div className="space-y-8">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Google カレンダー</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            ログイン時に連携した Google アカウントのカレンダーを参照し、空き時間の取得と予定登録に使用します。
          </p>
          <div className="flex items-center gap-2">
            <StatusBadge connected={googleConnected} />
            {googleConnected && (
              <span className="text-xs text-gray-500">{session.user.email}</span>
            )}
          </div>
          {googleConnected && (
            <label className="block space-y-1 max-w-md">
              <span className="text-sm text-gray-700">連携中のカレンダー ID</span>
              <input
                type="text"
                readOnly
                value={calendarId}
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-gray-600 font-mono"
              />
            </label>
          )}
          {!googleConnected && (
            <p className="text-sm text-gray-500">
              Google アカウントでログインすると自動的に連携されます。
            </p>
          )}
        </section>

        <section className="space-y-3 pt-6 border-t border-border">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-medium text-gray-900">日程調整カレンダー</h3>
            <Link
              href="/calendars/new"
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
                <li key={cal.id} className="px-4 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{cal.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {buildPublicCalendarUrl(cal.slug)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
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
          )}
        </section>
      </div>
    </AccountSettingsSection>
  );
}
