import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  buildZoomAuthorizeUrl,
  createZoomOAuthState,
  ZOOM_OAUTH_STATE_COOKIE,
  zoomOAuthStateCookieOptions,
} from "@/lib/zoom";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3002"));
  }

  try {
    const { state, cookieValue } = createZoomOAuthState(session.user.id);
    const authorizeUrl = buildZoomAuthorizeUrl(state);
    const res = NextResponse.redirect(authorizeUrl);
    res.cookies.set(ZOOM_OAUTH_STATE_COOKIE, cookieValue, zoomOAuthStateCookieOptions());
    return res;
  } catch (err) {
    console.error("Zoom authorize error:", err);
    const base = (process.env.NEXTAUTH_URL ?? "http://localhost:3002").replace(/\/$/, "");
    return NextResponse.redirect(
      `${base}/account/integrations?zoom=error&message=${encodeURIComponent(
        err instanceof Error ? err.message : "Zoom 連携の開始に失敗しました"
      )}`
    );
  }
}
