"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  onLogout?: () => void | Promise<void>;
};

export function AdminUserMenu({ onLogout }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
      await onLogout?.();
      navigate("/admin/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 bg-muted transition-colors ${
          open ? "bg-gray-200" : "hover:bg-gray-200"
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
          <UserIcon />
        </span>
        <span className="text-sm text-gray-700">管理者アカウント</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-white py-1 shadow-md z-50"
        >
          <button
            type="button"
            role="menuitem"
            disabled={loading}
            onClick={() => {
              setOpen(false);
              void handleLogout();
            }}
            className="w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-muted transition-colors disabled:opacity-50"
          >
            {loading ? "ログアウト中..." : "ログアウト"}
          </button>
        </div>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}
