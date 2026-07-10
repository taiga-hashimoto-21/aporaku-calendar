import { auth } from "@/lib/auth";
import { ensureCurrentTeam, listTeamMembers } from "@/lib/team";
import { redirect } from "next/navigation";
import { CalendarCreateForm } from "@/components/calendar-create-form";

export default async function NewCalendarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const team = await ensureCurrentTeam(session.user.id);
  const members = await listTeamMembers(team.id);

  return (
    <CalendarCreateForm
      currentUserId={session.user.id}
      members={members.map((m) => ({
        userId: m.userId,
        name: m.name,
        email: m.email,
        image: m.image,
      }))}
    />
  );
}
