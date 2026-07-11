"use client";

import { useState } from "react";
import type { DayOfWeek, TimeSlot } from "@/types/calendar";
import {
  DEFAULT_SCHEDULE_CANDIDATE_SETTINGS,
  MIN_NOTICE_OPTIONS,
  WEEKDAY_OPTIONS,
  WEEKDAY_SHORT_OPTIONS,
  type ScheduleCandidateSettingsValue,
} from "@/lib/schedule-candidate-settings";
import { PresetSelectField } from "@/components/preset-select-field";

type ScheduleCandidateSettingsProps = {
  value: ScheduleCandidateSettingsValue;
  onChange: (value: ScheduleCandidateSettingsValue) => void;
  minNoticeError?: string;
};

type DayEditorDraft = {
  accepting: boolean;
  slots: TimeSlot[];
  applyToDays: DayOfWeek[];
};

export function ScheduleCandidateSettings({
  value,
  onChange,
  minNoticeError,
}: ScheduleCandidateSettingsProps) {
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);
  const [draft, setDraft] = useState<DayEditorDraft | null>(null);

  function patch(partial: Partial<ScheduleCandidateSettingsValue>) {
    onChange({ ...value, ...partial });
  }

  function openDayEditor(day: DayOfWeek) {
    const slots = value.weeklyAvailability[day];
    setEditingDay(day);
    setDraft({
      accepting: slots.length > 0,
      slots:
        slots.length > 0
          ? slots.map((slot) => ({ ...slot }))
          : [{ start: "10:00", end: "19:00" }],
      applyToDays: [],
    });
  }

  function closeDayEditor() {
    setEditingDay(null);
    setDraft(null);
  }

  function saveDayEditor() {
    if (!editingDay || !draft) return;

    const slots = draft.accepting
      ? draft.slots.filter((slot) => slot.start && slot.end)
      : [];
    const next = { ...value.weeklyAvailability };
    const targetDays = [
      editingDay,
      ...draft.applyToDays.filter((day) => day !== editingDay),
    ];

    for (const day of targetDays) {
      next[day] = slots.map((slot) => ({ ...slot }));
    }

    patch({ weeklyAvailability: next });
    closeDayEditor();
  }

  const editingDayLabel =
    WEEKDAY_OPTIONS.find((day) => day.key === editingDay)?.label ?? "";

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">曜日ごとの受付時間</h3>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-border">
          {WEEKDAY_OPTIONS.map((day, index) => {
            const slots = value.weeklyAvailability[day.key];
            return (
              <button
                key={day.key}
                type="button"
                aria-label={`${day.label}の受付時間を編集`}
                onClick={() => openDayEditor(day.key)}
                className={`flex min-w-0 flex-1 cursor-pointer flex-col items-stretch justify-start bg-white transition-colors hover:bg-muted/50 ${
                  index < WEEKDAY_OPTIONS.length - 1 ? "border-r border-border" : ""
                }`}
              >
                <div className="shrink-0 px-2 pt-3">
                  <p className="w-full whitespace-nowrap text-center text-sm font-bold leading-5 text-gray-900">
                    {day.label}
                  </p>
                </div>
                <div className="flex min-h-[4.5rem] flex-1 items-center justify-center px-2 pb-3">
                  <WeeklySlotDisplay slots={slots} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">祝日の予約受付</h3>
        <BinarySegment
          value={value.acceptHolidayBookings ? "accept" : "reject"}
          onChange={(next) => patch({ acceptHolidayBookings: next === "accept" })}
          options={[
            { value: "accept", label: "受け付ける" },
            { value: "reject", label: "受け付けない" },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">
          何時間後から先の日程を提示しますか？
        </h3>
        <PresetSelectField
          id="min-notice-select"
          options={MIN_NOTICE_OPTIONS}
          mode={value.minNoticeMode}
          presetValue={value.minNoticeHours}
          customValue={
            value.minNoticeMode === "custom" ? String(value.minNoticeHours || "") : ""
          }
          error={minNoticeError}
          customUnit="時間後"
          customPlaceholder="時間を入力"
          customMin={0}
          customMax={168}
          formatCustomSelected={(hours) => `${hours} 時間後`}
          onSelectPreset={(hours) =>
            patch({ minNoticeMode: "preset", minNoticeHours: hours })
          }
          onSelectCustom={() => patch({ minNoticeMode: "custom" })}
          onCustomChange={(hours) =>
            patch({ minNoticeMode: "custom", minNoticeHours: Number(hours) })
          }
        />
      </section>

      {editingDay && draft && (
        <DayScheduleModal
          dayKey={editingDay}
          dayLabel={editingDayLabel}
          draft={draft}
          onDraftChange={setDraft}
          onClose={closeDayEditor}
          onSave={saveDayEditor}
        />
      )}
    </div>
  );
}

export function createDefaultScheduleCandidateSettings(): ScheduleCandidateSettingsValue {
  return {
    ...DEFAULT_SCHEDULE_CANDIDATE_SETTINGS,
    weeklyAvailability: {
      ...DEFAULT_SCHEDULE_CANDIDATE_SETTINGS.weeklyAvailability,
    },
  };
}

function WeeklySlotDisplay({ slots }: { slots: TimeSlot[] }) {
  if (slots.length === 0) {
    return (
      <p className="text-center text-sm leading-none text-gray-600">受付なし</p>
    );
  }

  const slot = slots[0];
  return (
    <div className="flex flex-col items-center justify-center gap-0 text-sm leading-none text-gray-600">
      <span>{slot.start}</span>
      <span className="inline-block -my-0.5 rotate-90">~</span>
      <span>{slot.end}</span>
    </div>
  );
}

function BinarySegment<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            value === option.value
              ? "bg-primary-light text-primary"
              : "text-gray-700 hover:bg-muted"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function DayScheduleModal({
  dayKey,
  dayLabel,
  draft,
  onDraftChange,
  onClose,
  onSave,
}: {
  dayKey: DayOfWeek;
  dayLabel: string;
  draft: DayEditorDraft;
  onDraftChange: (draft: DayEditorDraft) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  function patchDraft(partial: Partial<DayEditorDraft>) {
    onDraftChange({ ...draft, ...partial });
  }

  function updateSlot(index: number, partial: Partial<TimeSlot>) {
    const slots = draft.slots.map((slot, i) =>
      i === index ? { ...slot, ...partial } : slot
    );
    patchDraft({ slots });
  }

  function addSlotAfter(index: number) {
    patchDraft({
      slots: [
        ...draft.slots.slice(0, index + 1),
        { start: "", end: "" },
        ...draft.slots.slice(index + 1),
      ],
    });
  }

  function removeSlot(index: number) {
    if (draft.slots.length <= 1) return;
    patchDraft({ slots: draft.slots.filter((_, i) => i !== index) });
  }

  function toggleApplyDay(day: DayOfWeek) {
    if (day === dayKey) return;
    const applyToDays = draft.applyToDays.includes(day)
      ? draft.applyToDays.filter((item) => item !== day)
      : [...draft.applyToDays, day];
    patchDraft({ applyToDays });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-schedule-title"
        className="w-full max-w-lg rounded-lg border border-border bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h4 id="day-schedule-title" className="text-base font-semibold text-gray-900">
            {dayLabel}のスケジュール
          </h4>
          <button
            type="button"
            aria-label="閉じる"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-muted hover:text-gray-800 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={draft.accepting}
              onChange={(event) => patchDraft({ accepting: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/30"
            />
            <span className="text-sm text-gray-800">{dayLabel}に予定を受け付けます</span>
          </label>

          {draft.accepting && (
            <div className="space-y-3">
              {draft.slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-2">
                  <TimeInput
                    value={slot.start}
                    onChange={(start) => updateSlot(index, { start })}
                  />
                  <span className="text-gray-400">—</span>
                  <TimeInput
                    value={slot.end}
                    onChange={(end) => updateSlot(index, { end })}
                  />
                  <button
                    type="button"
                    aria-label="時間帯を削除"
                    onClick={() => removeSlot(index)}
                    disabled={draft.slots.length <= 1}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-400 bg-white text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-border disabled:text-gray-400 disabled:hover:bg-white transition-colors"
                  >
                    <TrashIcon />
                  </button>
                  <button
                    type="button"
                    aria-label="時間帯を追加"
                    onClick={() => addSlotAfter(index)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary bg-white text-primary hover:bg-primary-light transition-colors"
                  >
                    <PlusIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-800">
              他の曜日にも適用する（上書きされます）
            </p>
            <div className="flex overflow-hidden rounded-lg border border-border">
              {WEEKDAY_SHORT_OPTIONS.map((day, index) => {
                const isCurrent = day.key === dayKey;
                const selected = draft.applyToDays.includes(day.key);
                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => toggleApplyDay(day.key)}
                    className={`min-w-0 flex-1 px-2 py-2.5 text-sm font-medium transition-colors ${
                      index < WEEKDAY_SHORT_OPTIONS.length - 1
                        ? "border-r border-border"
                        : ""
                    } ${
                      isCurrent
                        ? "cursor-default bg-muted text-gray-400"
                        : selected
                          ? "bg-primary-light text-primary"
                          : "bg-white text-gray-700 hover:bg-muted/50"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border py-2 pl-3 pr-9 text-sm"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <ClockIcon />
      </span>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M4 4 12 12M12 4 4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 5v3l2 1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M3.5 4.5h9M6 4.5V3.5h4v1M5.5 4.5 6 12.5h4l.5-8"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
