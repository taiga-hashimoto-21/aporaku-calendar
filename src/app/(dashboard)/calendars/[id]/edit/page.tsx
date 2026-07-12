import { auth } from "@/lib/auth";
import { findAccessibleCalendar, listTeamMembers } from "@/lib/team";
import { notFound } from "next/navigation";
import { CalendarEditForm } from "@/components/calendar-edit-form";

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

  const calendar = await findAccessibleCalendar(session.user.id, id);
  if (!calendar) notFound();

  const members = await listTeamMembers(calendar.teamId);

  return (
    <CalendarEditForm
      calendar={{
        id: calendar.id,
        name: calendar.name,
        privateName: calendar.privateName,
        description: calendar.description,
        durationMinutes: calendar.durationMinutes,
        bufferBeforeMinutes: calendar.bufferBeforeMinutes,
        bufferAfterMinutes: calendar.bufferAfterMinutes,
        meetingType: calendar.meetingType,
        bookingWindowDays: calendar.bookingWindowDays,
        minNoticeHours: calendar.minNoticeHours,
        isActive: calendar.isActive,
        timezone: calendar.timezone,
        acceptHolidayBookings: calendar.acceptHolidayBookings,
        weeklyAvailability: calendar.weeklyAvailability,
        dateOverrides: calendar.dateOverrides,
        participationMode: calendar.participationMode,
        participantIds: calendar.participants.map((p) => p.userId),
      }}
      members={members.map((m) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        image: m.image,
      }))}
      currentUserId={session.user.id}
      justCreated={created === "1"}
    />
  );
}
