import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../lib/auth";

export function CompanyOnboardingPage() {
  const { user, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "");
  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.companyName) setCompanyName(user.companyName);
  }, [user?.name, user?.companyName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, companyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");
      await refreshSession();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-gray-900 hover:opacity-80"
          >
            アポラク日程調整
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6 rounded-lg bg-white px-10 py-12 border border-border">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              氏名は Google アカウントの名前を入れています。
              <br />
              会社名を登録して始めましょう。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="onboarding-email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                メールアドレス
              </label>
              <input
                id="onboarding-email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                className="w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-gray-600"
              />
            </div>

            <div>
              <label
                htmlFor="onboarding-name"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                id="onboarding-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="onboarding-company"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                id="onboarding-company"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={200}
                placeholder="株式会社〇〇"
                autoFocus
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim() || !companyName.trim()}
              className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {loading ? "保存中..." : "保存して始める"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
