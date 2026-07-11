import { AdminNav } from "@/components/admin-nav";

/** 認証待ち・初回描画用。実レイアウトと同じ骨格（変数だけ shimmer） */
export function AdminFrameSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <span className="shrink-0 text-sm font-semibold text-gray-900">
            アポラク日程調整
          </span>
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-muted">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            <span className="text-sm text-gray-700">管理者アカウント</span>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-6 py-8 flex gap-8 items-start">
          <AdminNav />
          <div className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="h-8 w-32 rounded shimmer" />
              <div className="h-5 w-10 rounded shimmer" />
            </div>
            <div className="rounded-lg bg-white border border-border overflow-hidden">
              <div className="bg-muted/60 px-5 py-3 flex gap-8">
                <div className="h-3 w-12 rounded shimmer" />
                <div className="h-3 w-16 rounded shimmer" />
                <div className="h-3 w-20 rounded shimmer" />
              </div>
              <div className="divide-y divide-border">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="px-5 py-3 flex gap-8">
                    <div className="h-4 w-24 rounded shimmer" />
                    <div className="h-4 w-40 rounded shimmer" />
                    <div className="h-4 w-8 rounded shimmer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
