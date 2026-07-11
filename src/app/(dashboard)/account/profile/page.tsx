import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileNameForm } from "@/components/profile-name-form";
import { AccountSettingsSection } from "@/components/account-settings-section";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true },
  });

  if (!user) return null;

  return (
    <AccountSettingsSection title="プロフィール">
      <ProfileNameForm
        initialName={user.name ?? session.user.name ?? ""}
        initialCompanyName={user.companyName ?? ""}
        email={user.email}
      />
    </AccountSettingsSection>
  );
}
