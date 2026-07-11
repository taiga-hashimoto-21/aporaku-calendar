import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CalendarCreateForm } from "@/components/calendar-create-form";
import { CalendarCreatePageSkeleton } from "../components/CalendarCreatePageSkeleton";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type MemberOption = {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
};

type MembersResponse = {
  members: Array<{
    userId: string;
    name: string | null;
    email: string;
    image: string | null;
  }>;
};

export function CalendarNewPage() {
  const { user, loading: authLoading, teamVersion, currentTeam } = useAuth();
  const [members, setMembers] = useState<MemberOption[]>([]);
  /** members が紐づくチーム。初回 null */
  const [membersTeamKey, setMembersTeamKey] = useState<string | null>(null);
  const membersTeamKeyRef = useRef<string | null>(null);
  membersTeamKeyRef.current = membersTeamKey;

  useEffect(() => {
    if (authLoading || !user) return;

    const teamKey = currentTeam?.id ?? user.id;
    let cancelled = false;

    async function load() {
      // チーム切替時は旧メンバーを即クリア → 選択中チップもチーム外として削除される
      if (
        membersTeamKeyRef.current !== null &&
        membersTeamKeyRef.current !== teamKey
      ) {
        setMembers([]);
      }

      try {
        const data = await api<MembersResponse>("/api/team/members");
        if (cancelled) return;
        setMembers(
          (data.members ?? []).map((m) => ({
            userId: m.userId,
            name: m.name,
            email: m.email,
            image: m.image,
          }))
        );
        setMembersTeamKey(teamKey);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "メンバーの取得に失敗しました");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, teamVersion, currentTeam?.id]);

  // 初回のみ全ページスケルトン。切替後はフォームを残す（入力内容は維持）
  if (authLoading || !user || membersTeamKey === null) {
    return <CalendarCreatePageSkeleton />;
  }

  return (
    <CalendarCreateForm currentUserId={user.id} members={members} />
  );
}
