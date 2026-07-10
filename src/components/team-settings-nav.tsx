"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "カレンダー", exact: true },
  { href: "/dashboard/team", label: "チーム" },
] as const;

export function TeamSettingsNav() {
  const pathname = usePathname();

  return (
    <aside className="w-44 shrink-0">
      <p className="text-xs text-gray-500 mb-3 px-1">チーム設定</p>
      <nav className="rounded-lg bg-white p-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, ...item }) => {
          const exact = "exact" in item && item.exact;
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard" || pathname.startsWith("/calendars/")
              : exact
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
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
