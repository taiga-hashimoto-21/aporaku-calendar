import { prisma } from "@/lib/prisma";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { AdminAccountsTable } from "@/components/admin-accounts-table";

export default async function AdminAccountsPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          teamMemberships: true,
          calendars: true,
        },
      },
    },
  });

  const rows = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    teamCount: user._count.teamMemberships,
    calendarCount: user._count.calendars,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <AccountSettingsSection
      title="アカウント"
      action={<span className="text-sm text-gray-500">{rows.length}件</span>}
      unboxed
    >
      <AdminAccountsTable rows={rows} />
    </AccountSettingsSection>
  );
}
