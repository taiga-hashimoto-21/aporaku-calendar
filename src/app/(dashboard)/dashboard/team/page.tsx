import { auth } from "@/lib/auth";
import { ensureCurrentTeam, listTeamMembers } from "@/lib/team";
import {
  AccountSettingsSection,
  SettingsCard,
} from "@/components/account-settings-section";
import { TeamProfileForm } from "@/components/team-profile-form";
import { TeamMembersSection } from "@/components/team-members-section";

export default async function TeamSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const team = await ensureCurrentTeam(session.user.id);
  const members = await listTeamMembers(team.id);
  const isOwner = team.ownerUserId === session.user.id;

  return (
    <AccountSettingsSection title="チーム設定" unboxed>
      <div className="space-y-4">
        <SettingsCard>
          <TeamProfileForm key={team.id} teamId={team.id} initialName={team.name} />
        </SettingsCard>
        <SettingsCard>
          <TeamMembersSection members={members} isOwner={isOwner} />
        </SettingsCard>
      </div>
    </AccountSettingsSection>
  );
}
