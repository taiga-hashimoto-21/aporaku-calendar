"use client";

import { useMemo, useState } from "react";
import { formatAdminDate } from "@/lib/admin-format";

export type AdminAccountRow = {
  id: string;
  name: string | null;
  email: string;
  teamCount: number;
  calendarCount: number;
  createdAt: string;
};

type SortKey = "name" | "email" | "teamCount" | "calendarCount" | "createdAt";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "name", label: "名前" },
  { key: "email", label: "メール" },
  { key: "teamCount", label: "所属チーム数" },
  { key: "calendarCount", label: "カレンダー数" },
  { key: "createdAt", label: "登録日" },
];

function compareRows(a: AdminAccountRow, b: AdminAccountRow, key: SortKey, dir: SortDir) {
  const factor = dir === "asc" ? 1 : -1;
  switch (key) {
    case "name": {
      const an = (a.name?.trim() || a.email).toLowerCase();
      const bn = (b.name?.trim() || b.email).toLowerCase();
      return an.localeCompare(bn, "ja") * factor;
    }
    case "email":
      return a.email.toLowerCase().localeCompare(b.email.toLowerCase(), "ja") * factor;
    case "teamCount":
      return (a.teamCount - b.teamCount) * factor;
    case "calendarCount":
      return (a.calendarCount - b.calendarCount) * factor;
    case "createdAt":
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
  }
}

export function AdminAccountsTable({ rows }: { rows: AdminAccountRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(
    () => [...rows].sort((a, b) => compareRows(a, b, sortKey, sortDir)),
    [rows, sortKey, sortDir]
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "createdAt" || key === "teamCount" || key === "calendarCount" ? "desc" : "asc");
  }

  return (
    <div className="rounded-lg bg-white border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/60 text-xs text-gray-500">
            <tr>
              {COLUMNS.map(({ key, label }) => {
                const active = sortKey === key;
                return (
                  <th key={key} className="p-0 font-medium">
                    <button
                      type="button"
                      onClick={() => handleSort(key)}
                      className={`flex w-full items-center gap-1 px-5 py-3 text-left hover:bg-muted hover:text-gray-900 transition-colors ${
                        active ? "text-gray-900" : ""
                      }`}
                    >
                      <span>{label}</span>
                      <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center">
                        <SortIndicator active={active} dir={sortDir} />
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                  アカウントがありません
                </td>
              </tr>
            ) : (
              sorted.map((user) => (
                <tr key={user.id} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {user.name?.trim() || "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-700">{user.email}</td>
                  <td className="px-5 py-3 text-gray-700">{user.teamCount}</td>
                  <td className="px-5 py-3 text-gray-700">{user.calendarCount}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {formatAdminDate(new Date(user.createdAt))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <svg
      className={`h-3 w-3 ${active ? "opacity-100" : "opacity-0"}`}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
    >
      {dir === "asc" ? (
        <path d="M6 2.5L10 8.5H2L6 2.5z" />
      ) : (
        <path d="M6 9.5L2 3.5h8L6 9.5z" />
      )}
    </svg>
  );
}
