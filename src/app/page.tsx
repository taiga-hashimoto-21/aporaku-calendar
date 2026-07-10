import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold">日程調整ツール</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary-hover transition-colors"
            >
              無料で新規登録
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              ビジネスの日程調整を自動化
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Googleカレンダーとリアルタイムに連携。
              <br className="hidden sm:block" />
              空き時間の表示から予約確定、Web会議 URL 発行まで自動化します。
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              無料で新規登録
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg border border-border bg-white px-8 py-3 text-sm font-medium hover:bg-muted transition-colors"
            >
              ログイン
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            無料プランは完全無料。クレジットカード登録不要です。
          </p>
        </div>
      </main>
    </div>
  );
}
