import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { CalendarEditForm } from "@/components/calendar-edit-form";
import type { ParticipationModeValue } from "@/components/calendar-participant-settings";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type MemberOption = {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
};

type CalendarResponse = {
  calendar: {
    id: string;
    name: string;
    description: string | null;
    durationMinutes: number;
    bufferBeforeMinutes: number;
    bufferAfterMinutes: number;
    meetingType: "none" | "zoom" | "google_meet";
    bookingWindowDays: number;
    minNoticeHours: number;
    isActive: boolean;
    weeklyAvailability: unknown;
    participationMode: ParticipationModeValue;
    participantIds: string[];
    publicUrl: string;
    teamId: string;
  };
};

type MembersResponse = {
  members: Array<{
    userId: string;
    name: string | null;
    email: string;
    image: string | null;
  }>;
};

function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="h-8 w-40 rounded shimmer" />
      </div>
      <div className="rounded-lg bg-white p-6 space-y-4">
        <div className="h-4 w-3/4 max-w-md rounded shimmer" />
        <div className="h-10 w-full rounded shimmer" />
        <div className="h-10 w-full rounded shimmer" />
        <div className="h-32 w-full rounded shimmer" />
      </div>
    </div>
  );
}

export function CalendarEditPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const justCreated = searchParams.get("created") === "1";

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [calendar, setCalendar] = useState<CalendarResponse["calendar"] | null>(null);
  const [members, setMembers] = useState<MemberOption[]>([]);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const [calData, membersData] = await Promise.all([
          api<CalendarResponse>(`/api/calendars/${id}`),
          api<MembersResponse>("/api/team/members"),
        ]);
        if (cancelled) return;
        setCalendar(calData.calendar);
        setMembers(
          (membersData.members ?? []).map((m) => ({
            userId: m.userId,
            name: m.name,
            email: m.email,
            image: m.image,
          }))
        );
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "カレンダーの取得に失敗しました";
        if (message.toLowerCase().includes("not found") || message.includes("404")) {
          setNotFound(true);
        } else {
          toast.error(message);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading || !user) {
    return <PageLoading />;
  }

  if (notFound || !calendar) {
    return (
      <AccountSettingsSection title="カレンダー編集">
        <p className="text-sm text-gray-600">カレンダーが見つかりませんでした。</p>
      </AccountSettingsSection>
    );
  }

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
          participationMode: calendar.participationMode,
          participantIds: calendar.participantIds,
        }}
        members={members}
        currentUserId={user.id}
        publicUrl={calendar.publicUrl}
        justCreated={justCreated}
      />
    </AccountSettingsSection>
  );
}
