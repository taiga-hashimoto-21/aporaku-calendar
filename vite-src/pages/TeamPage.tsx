import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AccountSettingsSection,
  SettingsCard,
} from "@/components/account-settings-section";
import { TeamMembersSection } from "@/components/team-members-section";
import { TeamProfileForm } from "@/components/team-profile-form";
import { TeamSettingsPageSkeleton } from "../components/TeamSettingsPageSkeleton";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type TeamResponse = {
  id: string;
  name: string;
  slug: string;
};

type Member = {
  id: string;
  userId: string;
  role: "owner" | "member";
  name: string | null;
  email: string;
  image: string | null;
};

type MembersResponse = {
  teamId: string;
  teamName: string;
  isOwner: boolean;
  members: Member[];
};

export function TeamPage() {
  const { teamVersion } = useAuth();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [teamData, membersData] = await Promise.all([
        api<TeamResponse>("/api/team"),
        api<MembersResponse>("/api/team/members"),
      ]);
      setTeam(teamData);
      setMembers(membersData.members ?? []);
      setIsOwner(membersData.isOwner);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "チーム情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, teamVersion]);

  if (loading || !team) {
    return <TeamSettingsPageSkeleton />;
  }

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
