import { Link, Outlet } from "react-router-dom";
import { AdminNav } from "@/components/admin-nav";
import { AdminUserMenu } from "@/components/admin-user-menu";
import { useAdminAuth } from "../lib/admin-auth";

export function AdminLayout() {
  const { clearSession } = useAdminAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <Link
            to="/admin/accounts"
            className="shrink-0 text-sm font-semibold text-gray-900 hover:opacity-80 transition-opacity"
          >
            日程調整アプリ
          </Link>
          <AdminUserMenu onLogout={clearSession} />
        </div>
      </header>
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-6 py-8 flex gap-8 items-start">
          <AdminNav />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
