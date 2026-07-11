import { Link, useLocation } from "react-router-dom";
import { readCalendarCountHint } from "../lib/calendar-count-hint";
import { CalendarCreatePageSkeleton } from "./CalendarCreatePageSkeleton";
import { TeamSettingsPageSkeleton } from "./TeamSettingsPageSkeleton";

const NAV_ITEMS_TEAM = [
  { href: "/dashboard", label: "カレンダー", exact: true },
  { href: "/dashboard/team", label: "チーム設定" },
] as const;

const NAV_ITEMS_ACCOUNT = [
  { href: "/account/profile", label: "プロフィール" },
  { href: "/account/calendar", label: "連携カレンダー" },
  { href: "/account/integrations", label: "サービス連携" },
] as const;

function CalendarListRowSkeleton() {
  return (
    <li className="flex items-start justify-between gap-4 px-4 py-4">
      <div className="min-w-0 flex-1 space-y-1">
        <div className="h-5 w-40 max-w-full rounded shimmer" />
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-4 w-56 max-w-[70%] rounded shimmer" />
          <span className="shrink-0 text-xs font-medium text-gray-600">コピー</span>
        </div>
        <div className="h-3 w-28 rounded shimmer" />
      </div>
      <span className="shrink-0 text-sm text-primary">編集</span>
    </li>
  );
}

function DashboardCalendarBodySkeleton({ count }: { count: number }) {
  const hasList = count > 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">カレンダー</h1>
        {hasList ? (
          <span className="shrink-0 text-sm font-medium text-primary">カレンダーを追加</span>
        ) : null}
      </div>
      <div className="rounded-lg bg-white p-6">
        {hasList ? (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {Array.from({ length: Math.max(count, 1) }, (_, i) => (
              <CalendarListRowSkeleton key={i} />
            ))}
          </ul>
        ) : (
          <div className="py-10 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-gray-600">
              日程調整カレンダーがまだありません。
              <br />
              最初のカレンダーを作成してください。
            </p>
            <span className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900">
              カレンダーを作成
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function FrameBody() {
  const { pathname } = useLocation();
  const countHint = readCalendarCountHint() ?? 0;

  if (pathname === "/dashboard" || pathname === "/") {
    return <DashboardCalendarBodySkeleton count={countHint} />;
  }
  if (pathname === "/dashboard/team") {
    return <TeamSettingsPageSkeleton />;
  }
  if (pathname === "/calendars/new") {
    return <CalendarCreatePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded shimmer" />
      <div className="rounded-lg bg-white p-6 min-h-[12rem]">
        <div className="space-y-3">
          <div className="h-4 w-2/3 max-w-md rounded shimmer" />
          <div className="h-4 w-1/2 max-w-sm rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

/**
 * session 確定前のシェル。
 * 固定文言は実表示、チーム名・ユーザー名など変数だけ shimmer。
 */
export function DashboardFrameSkeleton() {
  const { pathname } = useLocation();
  const isAccount = pathname.startsWith("/account");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-sm font-semibold text-gray-900">日程調整アプリ</span>
            <div className="inline-flex w-fit max-w-[600px] items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5">
              <div className="h-4 w-28 rounded shimmer" />
              <svg
                className="h-3.5 w-3.5 shrink-0 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <span className="text-sm text-gray-600">ホーム</span>
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-muted">
              <div className="h-8 w-8 rounded-full shimmer" />
              <div className="h-4 w-24 rounded shimmer" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full bg-gray-50">
        <div className="mx-auto w-full max-w-5xl px-6 py-8 flex gap-8 items-start min-h-[calc(100vh-4.5rem)]">
          <aside className="w-44 shrink-0">
            {isAccount ? (
              <>
                <p className="text-xs text-gray-500 mb-3 px-1">アカウント設定</p>
                <nav className="rounded-lg bg-white p-2 space-y-0.5">
                  {NAV_ITEMS_ACCOUNT.map(({ href, label }) => {
                    const active = pathname === href || pathname.startsWith(`${href}/`);
                    return (
                      <Link
                        key={href}
                        to={href}
                        className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                          active
                            ? "bg-muted text-gray-900 font-medium"
                            : "text-gray-600 hover:text-gray-900 hover:bg-muted/60"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </>
            ) : (
              <nav className="rounded-lg bg-white p-2 space-y-0.5">
                {NAV_ITEMS_TEAM.map(({ href, label, ...item }) => {
                  const exact = "exact" in item && item.exact;
                  const active =
                    href === "/dashboard"
                      ? pathname === "/dashboard" || pathname.startsWith("/calendars/")
                      : exact
                        ? pathname === href
                        : pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      to={href}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                        active
                          ? "bg-muted text-gray-900 font-medium"
                          : "text-gray-600 hover:text-gray-900 hover:bg-muted/60"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </aside>

          <div className="flex-1 min-w-0">
            <FrameBody />
          </div>
        </div>
      </div>
    </div>
  );
}
