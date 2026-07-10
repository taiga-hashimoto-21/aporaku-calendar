"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarShareLink } from "@/components/calendar-share-link";
import {
  CalendarParticipantSettings,
  type CalendarParticipantSettingsValue,
  type ParticipantMemberOption,
  type ParticipationModeValue,
} from "@/components/calendar-participant-settings";

interface CalendarEditFormProps {
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
  };
  members: ParticipantMemberOption[];
  currentUserId: string;
  publicUrl: string;
  justCreated?: boolean;
}

export function CalendarEditForm({
  calendar,
  members,
  currentUserId,
  publicUrl,
  justCreated = false,
}: CalendarEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(calendar);
  const [participantSettings, setParticipantSettings] =
    useState<CalendarParticipantSettingsValue>({
      mode: calendar.participationMode,
      participantIds:
        calendar.participantIds.length > 0 ? calendar.participantIds : [currentUserId],
    });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    const participantIds =
      participantSettings.participantIds.length > 0
        ? participantSettings.participantIds
        : [currentUserId];

    try {
      const res = await fetch(`/api/calendars/${calendar.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          durationMinutes: form.durationMinutes,
          meetingType: form.meetingType,
          bookingWindowDays: form.bookingWindowDays,
          minNoticeHours: form.minNoticeHours,
          isActive: form.isActive,
          participationMode: participantSettings.mode,
          participantIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="overflow-hidden rounded-lg border border-border bg-white px-6 py-5 space-y-3">
        {justCreated && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            カレンダーを作成しました。予約リンクを共有できます。
          </p>
        )}
        <CalendarShareLink url={publicUrl} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="カレンダー名" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="説明">
          <textarea
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value || null })}
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="1枠の時間（分）">
            <select
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {[15, 30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>
                  {m}分
                </option>
              ))}
            </select>
          </Field>

          <Field label="Web会議">
            <select
              value={form.meetingType}
              onChange={(e) =>
                setForm({ ...form, meetingType: e.target.value as typeof form.meetingType })
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="none">なし</option>
              <option value="google_meet">Google Meet</option>
              <option value="zoom">Zoom</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="予約可能日数（先）">
            <input
              type="number"
              min={1}
              max={365}
              value={form.bookingWindowDays}
              onChange={(e) => setForm({ ...form, bookingWindowDays: Number(e.target.value) })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </Field>
          <Field label="最短予約（時間前）">
            <input
              type="number"
              min={0}
              max={168}
              value={form.minNoticeHours}
              onChange={(e) => setForm({ ...form, minNoticeHours: Number(e.target.value) })}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          公開する
        </label>

        <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 rounded-lg border border-border bg-white px-4 py-4">
          <span className="text-sm font-medium text-gray-700 pt-2">参加メンバー設定</span>
          <CalendarParticipantSettings
            members={members}
            value={participantSettings}
            onChange={setParticipantSettings}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">保存しました</p>}

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {loading ? "保存中..." : "変更を保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
