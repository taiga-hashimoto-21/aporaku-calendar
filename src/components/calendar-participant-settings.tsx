"use client";

import { useMemo } from "react";

export type ParticipationModeValue = "all" | "any" | "two_groups";

export type ParticipantMemberOption = {
  userId: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type CalendarParticipantSettingsValue = {
  mode: ParticipationModeValue;
  participantIds: string[];
};

const MODE_OPTIONS: {
  value: "all" | "any";
  label: string;
}[] = [
  { value: "all", label: "全員が参加" },
  { value: "any", label: "誰か一人が参加" },
];

type CalendarParticipantSettingsProps = {
  members: ParticipantMemberOption[];
  value: CalendarParticipantSettingsValue;
  onChange: (value: CalendarParticipantSettingsValue) => void;
};

export function CalendarParticipantSettings({
  members,
  value,
  onChange,
}: CalendarParticipantSettingsProps) {
  // チーム所属メンバーのみ（念のため userId で一意化）
  const teamMembers = useMemo(() => {
    const map = new Map<string, ParticipantMemberOption>();
    for (const m of members) {
      if (m.userId) map.set(m.userId, m);
    }
    return [...map.values()];
  }, [members]);

  const selectedMembers = useMemo(
    () => teamMembers.filter((m) => value.participantIds.includes(m.userId)),
    [teamMembers, value.participantIds]
  );

  const candidateMembers = useMemo(
    () => teamMembers.filter((m) => !value.participantIds.includes(m.userId)),
    [teamMembers, value.participantIds]
  );

  function setMode(mode: ParticipationModeValue) {
    onChange({ ...value, mode });
  }

  function addParticipant(userId: string) {
    if (!teamMembers.some((m) => m.userId === userId)) return;
    if (value.participantIds.includes(userId)) return;
    onChange({
      ...value,
      participantIds: [...value.participantIds, userId],
    });
  }

  function removeParticipant(userId: string) {
    onChange({
      ...value,
      participantIds: value.participantIds.filter((id) => id !== userId),
    });
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border p-0.5">
        {MODE_OPTIONS.map((opt) => {
          const active = (value.mode === "any" ? "any" : "all") === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-light text-primary"
                  : "text-gray-700 hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="min-h-[48px] rounded-lg border border-border bg-muted/30 px-3 py-2 flex flex-wrap gap-2 content-start">
          {selectedMembers.length === 0 ? (
            <span className="text-sm text-gray-400 py-1">メンバー未選択</span>
          ) : (
            selectedMembers.map((m) => {
              const label = m.name?.trim() || m.email;
              return (
                <span
                  key={m.userId}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-white px-2.5 py-1 text-sm text-gray-900"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeParticipant(m.userId)}
                    className="rounded-full p-0.5 text-gray-400 hover:text-gray-700"
                    aria-label={`${label}を外す`}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </span>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 shrink-0">候補メンバー：</span>
          {candidateMembers.length === 0 ? (
            <span className="text-sm text-gray-400">
              {teamMembers.length === 0
                ? "チームにメンバーがいません"
                : "追加できる候補はありません"}
            </span>
          ) : (
            candidateMembers.map((m) => {
              const label = m.name?.trim() || m.email;
              return (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => addParticipant(m.userId)}
                  className="inline-flex items-center rounded-full border border-border bg-white px-2.5 py-1 text-sm text-gray-900 hover:border-primary hover:bg-primary-light hover:text-primary transition-colors"
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
