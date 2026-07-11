"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  BOOKING_EMAIL_VARIABLE_GROUPS,
  type BookingEmailAudience,
  type BookingEmailTemplateKey,
} from "@/lib/booking-email-templates";

export type AdminDocumentTemplate = {
  key: BookingEmailTemplateKey;
  audience: BookingEmailAudience;
  subject: string;
  body: string;
  updatedAt: string | null;
};

const AUDIENCE_LABEL: Record<BookingEmailAudience, string> = {
  guest: "予約した人（ゲスト）向け",
  host: "参加メンバー（ホスト）向け",
};

type FieldName = "subject" | "body";

type Props = {
  initialTemplates: AdminDocumentTemplate[];
};

function insertAtCursor(
  value: string,
  insert: string,
  start: number,
  end: number
): { next: string; caret: number } {
  const next = `${value.slice(0, start)}${insert}${value.slice(end)}`;
  return { next, caret: start + insert.length };
}

function VariableChips({
  onInsert,
}: {
  onInsert: (variable: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-x-3 gap-y-1.5">
      {BOOKING_EMAIL_VARIABLE_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-wrap justify-end gap-1.5">
          {group.variables.map((variable) => {
            const label = variable.replace(/^\{|\}$/g, "");
            return (
              <button
                key={variable}
                type="button"
                onMouseDown={(e) => {
                  // フォーカスをフィールドから奪わない
                  e.preventDefault();
                }}
                onClick={() => onInsert(variable)}
                className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] transition-colors ${group.chipClassName}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function AdminDocumentsEditor({ initialTemplates }: Props) {
  const [templates, setTemplates] = useState<AdminDocumentTemplate[]>(initialTemplates);
  const [drafts, setDrafts] = useState<Record<string, { subject: string; body: string }>>(
    () =>
      Object.fromEntries(
        initialTemplates.map((t) => [t.key, { subject: t.subject, body: t.body }])
      )
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const subjectRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const bodyRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const selectionRefs = useRef<
    Record<string, { field: FieldName; start: number; end: number } | undefined>
  >({});

  const visible = useMemo(
    () =>
      (["guest", "host"] as const).map(
        (key) => templates.find((t) => t.key === key)!
      ),
    [templates]
  );

  function updateDraft(key: string, patch: Partial<{ subject: string; body: string }>) {
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }

  function rememberSelection(
    key: string,
    field: FieldName,
    el: HTMLInputElement | HTMLTextAreaElement
  ) {
    selectionRefs.current[key] = {
      field,
      start: el.selectionStart ?? el.value.length,
      end: el.selectionEnd ?? el.value.length,
    };
  }

  function insertVariable(key: string, field: FieldName, variable: string) {
    const draft = drafts[key];
    if (!draft) return;

    const el =
      field === "subject" ? subjectRefs.current[key] : bodyRefs.current[key];
    const remembered = selectionRefs.current[key];
    const start =
      el && document.activeElement === el
        ? el.selectionStart ?? draft[field].length
        : remembered?.field === field
          ? remembered.start
          : draft[field].length;
    const end =
      el && document.activeElement === el
        ? el.selectionEnd ?? draft[field].length
        : remembered?.field === field
          ? remembered.end
          : draft[field].length;

    const { next, caret } = insertAtCursor(draft[field], variable, start, end);
    updateDraft(key, { [field]: next });
    selectionRefs.current[key] = { field, start: caret, end: caret };

    requestAnimationFrame(() => {
      const target =
        field === "subject" ? subjectRefs.current[key] : bodyRefs.current[key];
      if (!target) return;
      target.focus();
      target.setSelectionRange(caret, caret);
    });
  }

  async function save(key: BookingEmailTemplateKey) {
    const draft = drafts[key];
    if (!draft) return;
    setSavingKey(key);
    try {
      const res = await fetch("/api/admin/documents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          key,
          subject: draft.subject,
          body: draft.body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");

      setTemplates((prev) =>
        prev.map((t) =>
          t.key === key
            ? {
                ...t,
                subject: data.template.subject,
                body: data.template.body,
                updatedAt: data.template.updatedAt,
              }
            : t
        )
      );
      setDrafts((prev) => ({
        ...prev,
        [key]: {
          subject: data.template.subject,
          body: data.template.body,
        },
      }));
      toast.success("保存しました");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-8">
      {visible.map((template) => {
        const draft = drafts[template.key] ?? {
          subject: template.subject,
          body: template.body,
        };
        const dirty =
          draft.subject !== template.subject || draft.body !== template.body;

        return (
          <section
            key={template.key}
            className="rounded-lg border border-border bg-white p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {AUDIENCE_LABEL[template.audience]}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  プレーンテキスト / key: {template.key}
                  {template.updatedAt
                    ? ` / 更新: ${new Date(template.updatedAt).toLocaleString("ja-JP")}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                disabled={!dirty || savingKey === template.key}
                onClick={() => void save(template.key)}
                className="shrink-0 cursor-pointer rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
              >
                {savingKey === template.key ? "保存中..." : "保存する"}
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <label className="shrink-0 pt-0.5 text-sm font-medium text-gray-700">
                  件名
                </label>
                <VariableChips
                  onInsert={(variable) =>
                    insertVariable(template.key, "subject", variable)
                  }
                />
              </div>
              <input
                ref={(el) => {
                  subjectRefs.current[template.key] = el;
                }}
                type="text"
                value={draft.subject}
                onChange={(e) =>
                  updateDraft(template.key, { subject: e.target.value })
                }
                onSelect={(e) =>
                  rememberSelection(template.key, "subject", e.currentTarget)
                }
                onKeyUp={(e) =>
                  rememberSelection(template.key, "subject", e.currentTarget)
                }
                onClick={(e) =>
                  rememberSelection(template.key, "subject", e.currentTarget)
                }
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <label className="shrink-0 pt-0.5 text-sm font-medium text-gray-700">
                  本文
                </label>
                <VariableChips
                  onInsert={(variable) =>
                    insertVariable(template.key, "body", variable)
                  }
                />
              </div>
              <textarea
                ref={(el) => {
                  bodyRefs.current[template.key] = el;
                }}
                value={draft.body}
                onChange={(e) =>
                  updateDraft(template.key, { body: e.target.value })
                }
                onSelect={(e) =>
                  rememberSelection(template.key, "body", e.currentTarget)
                }
                onKeyUp={(e) =>
                  rememberSelection(template.key, "body", e.currentTarget)
                }
                onClick={(e) =>
                  rememberSelection(template.key, "body", e.currentTarget)
                }
                rows={16}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono leading-relaxed"
              />
            </div>
          </section>
        );
      })}
    </div>
  );
}
