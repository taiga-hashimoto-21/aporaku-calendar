import { NextRequest, NextResponse } from "next/server";
import {
  exchangeZoomAuthorizationCode,
  fetchZoomUserId,
  upsertZoomConnection,
  verifyZoomOAuthState,
  ZOOM_OAUTH_STATE_COOKIE,
  zoomOAuthStateCookieOptions,
} from "@/lib/zoom";

function integrationsRedirect(query: string) {
  const base = (process.env.NEXTAUTH_URL ?? "http://localhost:3002").replace(/\/$/, "");
  return NextResponse.redirect(`${base}/account/integrations?${query}`);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const cookieState = request.cookies.get(ZOOM_OAUTH_STATE_COOKIE)?.value ?? null;

  const clearCookie = (res: NextResponse) => {
    res.cookies.set(ZOOM_OAUTH_STATE_COOKIE, "", {
      ...zoomOAuthStateCookieOptions(0),
      maxAge: 0,
    });
    return res;
  };

  if (error) {
    return clearCookie(
      integrationsRedirect(
        `zoom=error&message=${encodeURIComponent("Zoom での認可がキャンセルまたは拒否されました")}`
      )
    );
  }

  const verified = verifyZoomOAuthState(state, cookieState);
  if (!verified) {
    return clearCookie(
      integrationsRedirect(
        `zoom=error&message=${encodeURIComponent("不正なリクエストです。もう一度連携してください")}`
      )
    );
  }

  if (!code) {
    return clearCookie(
      integrationsRedirect(
        `zoom=error&message=${encodeURIComponent("認可コードが取得できませんでした")}`
      )
    );
  }

  try {
    const tokens = await exchangeZoomAuthorizationCode(code);
    const zoomUserId = await fetchZoomUserId(tokens.access_token);
    await upsertZoomConnection({
      userId: verified.userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      zoomUserId,
    });
    return clearCookie(integrationsRedirect("zoom=connected"));
  } catch (err) {
    console.error("Zoom callback error:", err);
    return clearCookie(
      integrationsRedirect(
        `zoom=error&message=${encodeURIComponent(
          err instanceof Error ? err.message : "Zoom 連携に失敗しました"
        )}`
      )
    );
  }
}
