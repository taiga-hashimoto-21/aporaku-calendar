import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin/accounts");
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link href="/" className="text-sm font-semibold text-gray-900 hover:opacity-80">
            日程調整アプリ
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white px-10 py-12 border border-border">
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-gray-500">管理者</p>
            <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
            <p className="text-sm text-gray-600">
              メールアドレスとパスワードでログインしてください。
            </p>
          </div>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
