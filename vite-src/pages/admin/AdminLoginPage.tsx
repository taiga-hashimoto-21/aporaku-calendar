import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLoginForm } from "@/components/admin-login-form";
import { useAdminAuth } from "../../lib/admin-auth";

export function AdminLoginPage() {
  const { loading, authenticated, refreshSession } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && authenticated) {
      navigate("/admin/accounts", { replace: true });
    }
  }, [loading, authenticated, navigate]);

  if (loading || authenticated) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <header className="border-b border-border bg-white">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <span className="text-sm font-semibold text-gray-900">日程調整アプリ</span>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-md space-y-6 rounded-lg bg-white px-10 py-12 border border-border">
            <div className="text-center space-y-2">
              <p className="text-xs font-medium text-gray-500">管理者</p>
              <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">メールアドレス</p>
                <div className="h-10 w-full rounded-lg shimmer" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">パスワード</p>
                <div className="h-10 w-full rounded-lg shimmer" />
              </div>
              <div className="h-10 w-full rounded-lg shimmer" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link to="/" className="text-sm font-semibold text-gray-900 hover:opacity-80">
            日程調整アプリ
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white px-10 py-12 border border-border">
          <div className="text-center space-y-2">
            <p className="text-xs font-medium text-gray-500">管理者</p>
            <h1 className="text-2xl font-bold text-gray-900">ログイン</h1>
          </div>
          <AdminLoginForm onSuccess={refreshSession} />
        </div>
      </div>
    </main>
  );
}
