"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarShareLink } from "@/components/calendar-share-link";
import { PresetSelectField } from "@/components/preset-select-field";
import {
  ScheduleCandidateSettings,
  createDefaultScheduleCandidateSettings,
} from "@/components/schedule-candidate-settings";
import {
  CalendarParticipantSettings,
  type CalendarParticipantSettingsValue,
  type ParticipantMemberOption,
} from "@/components/calendar-participant-settings";
import {
  resolveScheduleCandidateSettings,
  type PresetMode,
  type ScheduleCandidateSettingsValue,
} from "@/lib/schedule-candidate-settings";

const DURATION_OPTIONS = [
  { value: 15, label: "15 分" },
  { value: 30, label: "30 分" },
  { value: 45, label: "45 分" },
  { value: 60, label: "1 時間" },
  { value: 90, label: "1.5 時間" },
  { value: 120, label: "2 時間" },
] as const;

type IssuedCalendarLink = {
  id: string;
  slug: string;
  publicUrl: string;
};

const FORM_LABEL_CLASS = "text-sm font-medium text-gray-700 pt-2";

function FormLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className={FORM_LABEL_CLASS}>
      {children}
    </label>
  );
}

type CalendarCreateFormProps = {
  currentUserId: string;
  members: ParticipantMemberOption[];
};

export function CalendarCreateForm({
  currentUserId,
  members,
}: CalendarCreateFormProps) {
  const [name, setName] = useState("");
  const [usePrivateName, setUsePrivateName] = useState(false);
  const [privateName, setPrivateName] = useState("");
  const [durationMode, setDurationMode] = useState<PresetMode>("preset");
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [customDuration, setCustomDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [issuedLink, setIssuedLink] = useState<IssuedCalendarLink | null>(null);
  const [scheduleSettings, setScheduleSettings] = useState<ScheduleCandidateSettingsValue>(
    createDefaultScheduleCandidateSettings
  );
  const [participantSettings, setParticipantSettings] =
    useState<CalendarParticipantSettingsValue>({
      mode: "all",
      participantIds: [currentUserId],
    });

  function validate() {
    const next: Record<string, string> = {};

    if (!name.trim()) {
      next.name = "カレンダー名の入力が必須です。";
    }
    if (usePrivateName && !privateName.trim()) {
      next.privateName = "非公開カレンダー名の入力が必須です。";
    }
    if (durationMode === "custom") {
      const value = Number(customDuration);
      if (!Number.isFinite(value) || value < 5 || value > 480) {
        next.duration = "5〜480分の範囲で入力してください。";
      }
    }
    if (scheduleSettings.minNoticeMode === "custom") {
      if (
        !Number.isFinite(scheduleSettings.minNoticeHours) ||
        scheduleSettings.minNoticeHours < 0 ||
        scheduleSettings.minNoticeHours > 168
      ) {
        next.minNoticeHours = "0〜168時間の範囲で入力してください。";
      }
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const resolvedDuration =
      durationMode === "custom" ? Number(customDuration) : durationMinutes;
    const resolvedSchedule = resolveScheduleCandidateSettings(scheduleSettings);
    const participantIds =
      participantSettings.participantIds.length > 0
        ? participantSettings.participantIds
        : [currentUserId];

    try {
      const res = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          privateName: usePrivateName ? privateName.trim() : null,
          durationMinutes: resolvedDuration,
          timezone: resolvedSchedule.timezone,
          weeklyAvailability: resolvedSchedule.weeklyAvailability,
          dateOverrides: resolvedSchedule.dateOverrides,
          acceptHolidayBookings: resolvedSchedule.acceptHolidayBookings,
          minNoticeHours: resolvedSchedule.minNoticeHours,
          bookingWindowDays: resolvedSchedule.bookingWindowDays,
          participationMode: participantSettings.mode,
          participantIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "作成に失敗しました");
      setIssuedLink({
        id: data.id,
        slug: data.slug,
        publicUrl: data.publicUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (issuedLink) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">カレンダーを作成しました</h1>
          <p className="mt-2 text-sm text-gray-600">
            予約リンクが発行されました。相手に共有して日程調整を始められます。
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-white px-6 py-5">
          <CalendarShareLink url={issuedLink.publicUrl} />
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href={`/calendars/${issuedLink.id}/edit`}
            className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
          >
            設定を続ける
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
          >
            カレンダー一覧へ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">カレンダー作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-white divide-y divide-border">
            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <FormLabel htmlFor="calendar-name">
                カレンダー名<span className="text-red-500 ml-0.5">*</span>
              </FormLabel>
              <div className="space-y-2">
                <input
                  id="calendar-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="カレンダー名"
                  className={inputClass(fieldErrors.name)}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-600">{fieldErrors.name}</p>
                )}

                <OptionalCheckboxField
                  id="use-private-name"
                  enabled={usePrivateName}
                  onEnabledChange={setUsePrivateName}
                  label="非公開カレンダー名を設定する"
                  error={fieldErrors.privateName}
                >
                  <input
                    type="text"
                    value={privateName}
                    onChange={(e) => setPrivateName(e.target.value)}
                    placeholder="テストカレンダー"
                    className={inputClass(fieldErrors.privateName)}
                  />
                </OptionalCheckboxField>
              </div>
            </div>

            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <FormLabel htmlFor="duration-select">
                所要時間<span className="text-red-500 ml-0.5">*</span>
              </FormLabel>
              <DurationSelectField
                id="duration-select"
                mode={durationMode}
                minutes={durationMinutes}
                customValue={customDuration}
                error={fieldErrors.duration}
                onSelectPreset={(minutes) => {
                  setDurationMode("preset");
                  setDurationMinutes(minutes);
                }}
                onSelectCustom={() => setDurationMode("custom")}
                onCustomChange={(value) => {
                  setCustomDuration(value);
                  setDurationMode("custom");
                }}
              />
            </div>

            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <FormLabel>参加メンバー設定</FormLabel>
              <CalendarParticipantSettings
                members={members}
                value={participantSettings}
                onChange={setParticipantSettings}
              />
            </div>

            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <FormLabel>日程候補設定</FormLabel>
              <div className="space-y-2">
                <ScheduleCandidateSettings
                  value={scheduleSettings}
                  onChange={setScheduleSettings}
                  minNoticeError={fieldErrors.minNoticeHours}
                />
              </div>
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
          >
            {loading ? "作成中..." : "作成する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full rounded-lg border px-3 py-2 text-sm ${
    error ? "border-red-500" : "border-border"
  }`;
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <FormLabel htmlFor={htmlFor}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </FormLabel>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function OptionalCheckboxField({
  id,
  enabled,
  onEnabledChange,
  label,
  error,
  children,
}: {
  id: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="h-5 flex items-center">
        <StyledCheckbox
          id={id}
          checked={enabled}
          onChange={onEnabledChange}
          label={label}
        />
      </div>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          enabled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!enabled}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 pt-2">
            {enabled ? children : null}
            {enabled && error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StyledCheckbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 cursor-pointer select-none text-left border-0 bg-transparent p-0 m-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-sm"
    >
      <span
        className={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded border box-border transition-colors ${
          checked ? "border-primary bg-primary" : "border-gray-300 bg-white"
        }`}
      >
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className={`h-2.5 w-2.5 text-white transition-opacity ${
            checked ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden
        >
          <path
            d="M2 6.5 4.5 9 10 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-sm leading-none text-gray-800">{label}</span>
    </button>
  );
}

function DurationSelectField({
  id,
  mode,
  minutes,
  customValue,
  error,
  onSelectPreset,
  onSelectCustom,
  onCustomChange,
}: {
  id: string;
  mode: PresetMode;
  minutes: number;
  customValue: string;
  error?: string;
  onSelectPreset: (minutes: number) => void;
  onSelectCustom: () => void;
  onCustomChange: (value: string) => void;
}) {
  return (
    <PresetSelectField
      id={id}
      options={DURATION_OPTIONS}
      mode={mode}
      presetValue={minutes}
      customValue={customValue}
      error={error}
      customUnit="分"
      customPlaceholder="分数を入力"
      customMin={5}
      customMax={480}
      formatCustomSelected={(value) => `${value} 分`}
      onSelectPreset={onSelectPreset}
      onSelectCustom={onSelectCustom}
      onCustomChange={onCustomChange}
    />
  );
}
