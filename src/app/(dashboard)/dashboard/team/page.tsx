import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettingsSection } from "@/components/account-settings-section";

const LABEL_CLASS = "text-sm font-medium text-gray-700 pt-2";

export default async function TeamSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { teamSlug: true, timezone: true },
  });

  if (!user) return null;

  return (
    <AccountSettingsSection title="チーム">
      <div className="grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-5 items-start">
        <span className={LABEL_CLASS}>チーム ID</span>
        <input
          type="text"
          readOnly
          value={user.teamSlug}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-gray-600 font-mono"
        />

        <span className={LABEL_CLASS}>タイムゾーン</span>
        <input
          type="text"
          readOnly
          value={user.timezone}
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-gray-600"
        />
      </div>
    </AccountSettingsSection>
  );
}
