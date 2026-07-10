import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/admin/accounts"
            className="shrink-0 text-sm font-semibold text-gray-900 hover:opacity-80 transition-opacity"
          >
            日程調整アプリ
          </Link>
          <AdminLogoutButton />
        </div>
      </header>
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-6 py-8 flex gap-8 items-start">
          <AdminNav />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}
