import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountSettingsSection } from "@/components/account-settings-section";
import {
  AdminAccountsTable,
  type AdminAccountRow,
} from "@/components/admin-accounts-table";
import { api } from "../../lib/api";

function AccountsTableSkeleton() {
  return (
    <div className="rounded-lg bg-white border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/60 text-xs text-gray-500">
            <tr>
              {["名前", "メール", "所属チーム数", "カレンダー数", "登録日"].map((label) => (
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
                  <div className="h-4 w-24 rounded shimmer" />
                </td>
                <td className="px-5 py-3">
                  <div className="h-4 w-40 rounded shimmer" />
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

export function AdminAccountsPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminAccountRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await api<{ accounts: AdminAccountRow[] }>("/api/admin/accounts");
        if (cancelled) return;
        setRows(data.accounts);
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
      title="アカウント"
      action={
        loading ? (
          <div className="h-5 w-10 rounded shimmer" />
        ) : (
          <span className="text-sm text-gray-500">{rows.length}件</span>
        )
      }
      unboxed
    >
      {loading ? <AccountsTableSkeleton /> : <AdminAccountsTable rows={rows} />}
    </AccountSettingsSection>
  );
}
