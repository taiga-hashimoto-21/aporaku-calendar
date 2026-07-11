import Link from "next/link";
import { SERVICE_NAME } from "@/lib/brand";

export function MarketingHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-gray-900 hover:opacity-80">
          {SERVICE_NAME}
        </Link>
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
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-xs text-gray-400">{SERVICE_NAME}</p>
        <nav className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            プライバシーポリシー
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function LegalPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader />
      <main className="flex-1 px-6 py-12">
        <article className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-gray-500">
              {SERVICE_NAME} をご利用いただく前にご確認ください。
            </p>
          </div>
          <div className="prose-legal space-y-8 text-sm text-gray-700 leading-relaxed">
            {children}
          </div>
        </article>
      </main>
      <MarketingFooter />
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
