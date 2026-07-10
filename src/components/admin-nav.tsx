"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/accounts", label: "アカウント" },
  { href: "/admin/teams", label: "チーム" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-44 shrink-0">
      <nav className="rounded-lg bg-white p-2 space-y-0.5">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
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
