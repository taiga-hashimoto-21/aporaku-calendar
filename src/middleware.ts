import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "calendar-app.me";

/** SPA として配信するパス（Vite ビルドの index.html へ rewrite） */
const SPA_PREFIXES = [
  "/dashboard",
  "/calendars",
  "/account",
  "/settings",
  "/admin",
  "/onboarding",
];

function isSpaPath(pathname: string): boolean {
  return SPA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  if (host.endsWith(".vercel.app")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  // 本番: ダッシュボード系は Vite SPA の index.html を返す
  if (isSpaPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/index.html";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|assets).*)"],
};
