"use client";

import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { TeamSwitcher } from "@/components/team-switcher";

type DashboardHeaderProps = {
  userName: string;
  userImage: string | null | undefined;
  onSignOut: () => void;
  currentTeam: { id: string; name: string };
  onTeamChange?: (team: { id: string; name: string }) => void;
};

export function DashboardHeader({
  userName,
  userImage,
  onSignOut,
  currentTeam,
  onTeamChange,
}: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/dashboard" className="shrink-0 hover:opacity-80 transition-opacity">
            <span className="text-sm font-semibold text-gray-900">日程調整アプリ</span>
          </Link>
          <TeamSwitcher
            initialCurrentTeamId={currentTeam.id}
            initialCurrentTeamName={currentTeam.name}
            onTeamChange={onTeamChange}
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <Link
            to="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ホーム
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 bg-muted transition-colors ${
                open ? "bg-gray-200" : "hover:bg-gray-200"
              }`}
              aria-expanded={open}
              aria-haspopup="menu"
            >
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userImage}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {initial}
                </span>
              )}
              <span className="text-sm text-gray-700 max-w-[160px] truncate">{userName}</span>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-white py-1 shadow-md z-50"
              >
                <Link
                  to="/account/profile"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-muted transition-colors"
                >
                  アカウント設定
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-muted transition-colors"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
