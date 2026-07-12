import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCurrentTeam } from "@/lib/team";
import { buildPublicCalendarUrl } from "@/lib/utils";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { DashboardCalendarList } from "@/components/dashboard-calendar-list";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currentTeam = await ensureCurrentTeam(session.user.id);

  const calendars = await prisma.schedulingCalendar.findMany({
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
  });

  const hasCalendars = calendars.length > 0;

  return (
    <AccountSettingsSection
      title="カレンダー"
      action={
        hasCalendars ? (
          <Link
            href="/calendars/new"
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            カレンダーを追加
          </Link>
        ) : undefined
      }
    >
      {!hasCalendars ? (
        <div className="py-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-600">
            日程調整カレンダーがまだありません。
            <br />
            最初のカレンダーを作成してください。
          </p>
          <Link
            href="/calendars/new"
            className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
          >
            カレンダーを作成
          </Link>
        </div>
      ) : (
        <DashboardCalendarList
          calendars={calendars.map((cal) => ({
            id: cal.id,
            name: cal.name,
            publicUrl: buildPublicCalendarUrl(cal.slug),
            durationMinutes: cal.durationMinutes,
            meetingType: cal.meetingType,
            isActive: cal.isActive,
          }))}
        />
      )}
    </AccountSettingsSection>
  );
}
