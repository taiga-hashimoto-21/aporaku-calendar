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

/** Google ログイン必須のユーザー向け SPA（/admin は別認証のため除外） */
const USER_AUTH_SPA_PREFIXES = [
  "/dashboard",
  "/calendars",
  "/account",
  "/settings",
  "/onboarding",
];

const SESSION_COOKIE_NAMES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

function isSpaPath(pathname: string): boolean {
  return SPA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isUserAuthSpaPath(pathname: string): boolean {
  return USER_AUTH_SPA_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

function withNoIndex(response: NextResponse) {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function loginRedirect(request: NextRequest, pathname: string): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  const callbackPath = `${pathname}${request.nextUrl.search}`;
  // open redirect 防止: 同一オリジンの相対パスのみ
  if (callbackPath.startsWith("/") && !callbackPath.startsWith("//")) {
    loginUrl.searchParams.set("callbackUrl", callbackPath);
  }
  return withNoIndex(NextResponse.redirect(loginUrl));
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  if (host.endsWith(".vercel.app")) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return withNoIndex(NextResponse.redirect(url, 308));
  }

  // 未ログインなら SPA（スケルトン）を出さず、先にログインへ送る
  if (isUserAuthSpaPath(pathname) && !hasSessionCookie(request)) {
    return loginRedirect(request, pathname);
  }

  // 本番: ダッシュボード系は Vite SPA の index.html を返す
  if (isSpaPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/index.html";
    return withNoIndex(NextResponse.rewrite(url));
  }

  return withNoIndex(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|assets).*)"],
};
