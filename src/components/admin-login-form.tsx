"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ログインに失敗しました");
      router.replace("/admin/accounts");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          id="admin-email"
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-gray-700">
          パスワード
        </label>
        <div className="relative">
          <input
            id="admin-password"
            type={showPassword ? "text" : "password"}
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-lg border border-border px-3 py-2.5 pr-11 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
      />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75l16.5 16.5M9.88 9.88A2.75 2.75 0 0012 14.75a2.75 2.75 0 002.12-.88M6.53 6.53C4.5 7.9 2.25 12 2.25 12s3.75 6.75 9.75 6.75c1.7 0 3.2-.4 4.47-1.03M17.47 17.47C19.5 16.1 21.75 12 21.75 12s-3.75-6.75-9.75-6.75c-.9 0-1.75.12-2.53.33"
      />
    </svg>
  );
}
