import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountSettingsSection } from "@/components/account-settings-section";
import {
  AdminTeamsTable,
  type AdminTeamRow,
} from "@/components/admin-teams-table";
import { api } from "../../lib/api";

function TeamsTableSkeleton() {
  return (
    <div className="rounded-lg bg-white border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/60 text-xs text-gray-500">
            <tr>
              {["チーム名", "オーナー", "メンバー数", "カレンダー数", "作成日"].map((label) => (
                <th key={label} className="px-5 py-3 font-medium">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: 3 }, (_, i) => (
              <tr key={i}>
                <td className="px-5 py-3">
                  <div className="h-4 w-28 rounded shimmer" />
                </td>
                <td className="px-5 py-3 space-y-1">
                  <div className="h-4 w-24 rounded shimmer" />
                  <div className="h-3 w-36 rounded shimmer" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-8 rounded shimmer" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-8 rounded shimmer" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-28 rounded shimmer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminTeamsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminTeamRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await api<{ teams: AdminTeamRow[] }>("/api/admin/teams");
        if (cancelled) return;
        setRows(data.teams);
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
    <AccountSettingsSection
      title="チーム"
      action={
        loading ? (
          <div className="h-5 w-10 rounded shimmer" />
        ) : (
          <span className="text-sm text-gray-500">{rows.length}件</span>
        )
      }
      unboxed
    >
      {loading ? <TeamsTableSkeleton /> : <AdminTeamsTable rows={rows} />}
    </AccountSettingsSection>
  );
}
