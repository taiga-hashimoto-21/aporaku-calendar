import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CalendarEditForm } from "@/components/calendar-edit-form";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { buildPublicCalendarUrl } from "@/lib/utils";

export default async function EditCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;
  const { created } = await searchParams;

  const calendar = await prisma.schedulingCalendar.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!calendar) notFound();

  const publicUrl = buildPublicCalendarUrl(calendar.slug);

  return (
    <AccountSettingsSection title="カレンダー編集">
      <CalendarEditForm
        calendar={{
          id: calendar.id,
          name: calendar.name,
          description: calendar.description,
          durationMinutes: calendar.durationMinutes,
          bufferBeforeMinutes: calendar.bufferBeforeMinutes,
          bufferAfterMinutes: calendar.bufferAfterMinutes,
          meetingType: calendar.meetingType,
          bookingWindowDays: calendar.bookingWindowDays,
          minNoticeHours: calendar.minNoticeHours,
          isActive: calendar.isActive,
          weeklyAvailability: calendar.weeklyAvailability,
        }}
        publicUrl={publicUrl}
        justCreated={created === "1"}
      />
    </AccountSettingsSection>
  );
}
