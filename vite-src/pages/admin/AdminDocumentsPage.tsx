import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountSettingsSection } from "@/components/account-settings-section";
import {
  AdminDocumentsEditor,
  type AdminDocumentTemplate,
} from "@/components/admin-documents-editor";
import { BOOKING_EMAIL_VARIABLE_GROUPS } from "@/lib/booking-email-templates";
import { api } from "../../lib/api";

function VariableChipsSkeleton() {
  return (
    <div className="flex flex-wrap justify-end gap-x-3 gap-y-1.5">
      {BOOKING_EMAIL_VARIABLE_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-wrap justify-end gap-1.5">
          {group.variables.map((variable) => (
            <span
              key={variable}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] ${group.chipClassName}`}
            >
              {variable.replace(/^\{|\}$/g, "")}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function DocumentsSkeleton() {
  return (
    <div className="space-y-8">
      {["予約した人（ゲスト）向け", "参加メンバー（ホスト）向け"].map((title) => (
        <section
          key={title}
          className="rounded-lg border border-border bg-white p-6 space-y-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              <p className="mt-1 text-xs text-gray-500">
                プレーンテキスト / key:{" "}
                <span className="inline-block h-3 w-16 align-middle rounded shimmer" />
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-900 opacity-50">
              保存する
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="shrink-0 pt-0.5 text-sm font-medium text-gray-700">件名</p>
              <VariableChipsSkeleton />
            </div>
            <div className="h-10 w-full rounded-lg border border-border shimmer" />
          </div>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="shrink-0 pt-0.5 text-sm font-medium text-gray-700">本文</p>
              <VariableChipsSkeleton />
            </div>
            <div className="h-64 w-full rounded-lg border border-border shimmer" />
          </div>
        </section>
      ))}
    </div>
  );
}

export function AdminDocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<AdminDocumentTemplate[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await api<{ templates: AdminDocumentTemplate[] }>(
          "/api/admin/documents"
        );
        if (cancelled) return;
        setTemplates(data.templates);
      } catch (err) {
        if (cancelled) return;
        toast.error(err instanceof Error ? err.message : "読み込みに失敗しました");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AccountSettingsSection title="文面" unboxed>
      {loading ? (
        <DocumentsSkeleton />
      ) : (
        <AdminDocumentsEditor initialTemplates={templates} />
      )}
    </AccountSettingsSection>
  );
}
