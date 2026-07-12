import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  CalendarEditForm,
  type CalendarEditFormCalendar,
} from "@/components/calendar-edit-form";
import type { ParticipationModeValue } from "@/components/calendar-participant-settings";
import { CalendarCreatePageSkeleton } from "../components/CalendarCreatePageSkeleton";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type MemberOption = {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
};

type CalendarResponse = {
  calendar: CalendarEditFormCalendar & {
    publicUrl: string;
    teamId: string;
    participationMode: ParticipationModeValue;
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
    return <CalendarCreatePageSkeleton title="カレンダー編集" submitLabel="変更を保存する" />;
  }

  if (notFound || !calendar) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">カレンダー編集</h1>
        </div>
        <p className="text-sm text-gray-600">カレンダーが見つかりませんでした。</p>
      </div>
    );
  }

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
        participantIds: calendar.participantIds,
      }}
      members={members}
      currentUserId={user.id}
      justCreated={justCreated}
    />
  );
}
