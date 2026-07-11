"use client";

import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { href: "/admin/accounts", label: "アカウント" },
  { href: "/admin/teams", label: "チーム" },
  { href: "/admin/documents", label: "文面" },
] as const;

export function AdminNav() {
  const { pathname } = useLocation();

  return (
    <aside className="w-44 shrink-0">
      <p className="text-xs text-gray-500 mb-3 px-1">管理</p>
      <nav className="rounded-lg bg-white p-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              to={href}
              className={`block cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-muted text-gray-900 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-muted/60"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
