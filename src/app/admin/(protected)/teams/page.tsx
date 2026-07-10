import { prisma } from "@/lib/prisma";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { AdminTeamsTable } from "@/components/admin-teams-table";

export default async function AdminTeamsPage() {
  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      owner: {
        select: { name: true, email: true },
      },
      _count: {
        select: {
          members: true,
          calendars: true,
        },
      },
    },
  });

  const rows = teams.map((team) => ({
    id: team.id,
    name: team.name,
    ownerName: team.owner.name,
    ownerEmail: team.owner.email,
    memberCount: team._count.members,
    calendarCount: team._count.calendars,
    createdAt: team.createdAt.toISOString(),
  }));

  return (
    <AccountSettingsSection
      title="チーム"
      action={<span className="text-sm text-gray-500">{rows.length}件</span>}
      unboxed
    >
      <AdminTeamsTable rows={rows} />
    </AccountSettingsSection>
  );
}
