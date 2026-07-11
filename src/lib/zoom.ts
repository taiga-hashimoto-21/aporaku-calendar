import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { decryptToken, encryptToken } from "@/lib/encryption";

export const ZOOM_OAUTH_SCOPES = [
  "meeting:write:meeting",
  "meeting:read:meeting",
  "meeting:update:meeting",
  "meeting:delete:meeting",
  "user:read:user",
].join(" ");

const ZOOM_AUTHORIZE_URL = "https://zoom.us/oauth/authorize";
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

const STATE_COOKIE = "zoom_oauth_state";
const STATE_TTL_MS = 10 * 60 * 1000;

type ZoomTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
};

type ZoomOAuthStatePayload = {
  userId: string;
  nonce: string;
  exp: number;
};

function requireZoomCredentials() {
  const clientId = process.env.ZOOM_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.ZOOM_CLIENT_SECRET?.trim() ?? "";
  if (!clientId || !clientSecret) {
    throw new Error("ZOOM_CLIENT_ID / ZOOM_CLIENT_SECRET が未設定です");
  }
  return { clientId, clientSecret };
}

export function getZoomRedirectUri(): string {
  const explicit = process.env.ZOOM_REDIRECT_URI?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const base = (
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    "http://localhost:3002"
  ).replace(/\/$/, "");
  return `${base}/api/auth/callback/zoom`;
}

function authHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

function stateSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
  if (!secret) throw new Error("AUTH_SECRET が未設定です");
  return secret;
}

export function createZoomOAuthState(userId: string): {
  state: string;
  cookieValue: string;
} {
  const payload: ZoomOAuthStatePayload = {
    userId,
    nonce: crypto.randomBytes(16).toString("base64url"),
    exp: Date.now() + STATE_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", stateSecret()).update(body).digest("base64url");
  const state = `${body}.${sig}`;
  return { state, cookieValue: state };
}

export function verifyZoomOAuthState(
  state: string | null,
  cookieValue: string | null
): { userId: string } | null {
  if (!state) return null;
  // localhost 開始 → 127.0.0.1 コールバックだと cookie が届かないことがある。
  // cookie がある場合のみ一致を要求し、署名付き state 自体は必須。
  if (cookieValue && state !== cookieValue) return null;
  const [body, sig] = state.split(".");
  if (!body || !sig) return null;
  const expected = crypto.createHmac("sha256", stateSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as ZoomOAuthStatePayload;
    if (!payload.userId || !payload.exp || Date.now() > payload.exp) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export function zoomOAuthStateCookieOptions(maxAgeSeconds = 600) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export { STATE_COOKIE as ZOOM_OAUTH_STATE_COOKIE };

export function buildZoomAuthorizeUrl(state: string): string {
  const { clientId } = requireZoomCredentials();
  const url = new URL(ZOOM_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getZoomRedirectUri());
  url.searchParams.set("state", state);
  // Zoom はアプリ登録スコープを使う。明示指定は互換のため付与。
  url.searchParams.set("scope", ZOOM_OAUTH_SCOPES);
  return url.toString();
}

async function exchangeZoomToken(
  body: URLSearchParams
): Promise<ZoomTokenResponse> {
  const { clientId, clientSecret } = requireZoomCredentials();
  const res = await fetch(ZOOM_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = (await res.json()) as ZoomTokenResponse & { reason?: string; error?: string };
  if (!res.ok || !data.access_token || !data.refresh_token) {
    throw new Error(
      data.reason || data.error || `Zoom トークン取得に失敗しました (${res.status})`
    );
  }
  return data;
}

export async function exchangeZoomAuthorizationCode(code: string): Promise<ZoomTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getZoomRedirectUri(),
  });
  return exchangeZoomToken(params);
}

export async function refreshZoomAccessToken(refreshToken: string): Promise<ZoomTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  return exchangeZoomToken(params);
}

export async function fetchZoomUserId(accessToken: string): Promise<string | null> {
  const res = await fetch(`${ZOOM_API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { id?: string };
  return data.id ?? null;
}

export async function upsertZoomConnection(params: {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  zoomUserId?: string | null;
}) {
  const expiresAt = new Date(Date.now() + Math.max(30, params.expiresIn - 60) * 1000);
  return prisma.zoomConnection.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      accessTokenEnc: encryptToken(params.accessToken),
      refreshTokenEnc: encryptToken(params.refreshToken),
      expiresAt,
      zoomUserId: params.zoomUserId ?? null,
    },
    update: {
      accessTokenEnc: encryptToken(params.accessToken),
      refreshTokenEnc: encryptToken(params.refreshToken),
      expiresAt,
      zoomUserId: params.zoomUserId ?? undefined,
    },
  });
}

export async function deleteZoomConnection(userId: string) {
  await prisma.zoomConnection.deleteMany({ where: { userId } });
}

/** 有効な access_token を返す（期限切れなら refresh） */
export async function getValidZoomAccessToken(userId: string): Promise<string | null> {
  const connection = await prisma.zoomConnection.findUnique({ where: { userId } });
  if (!connection) return null;

  const refreshToken = decryptToken(connection.refreshTokenEnc);

  if (connection.expiresAt.getTime() > Date.now() + 60_000) {
    return decryptToken(connection.accessTokenEnc);
  }

  const refreshed = await refreshZoomAccessToken(refreshToken);
  await upsertZoomConnection({
    userId,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    expiresIn: refreshed.expires_in,
    zoomUserId: connection.zoomUserId,
  });
  return refreshed.access_token;
}

export type CreateZoomMeetingParams = {
  topic: string;
  startTimeIso: string;
  durationMinutes: number;
  timezone?: string;
  agenda?: string;
};

export async function createZoomMeeting(
  userId: string,
  params: CreateZoomMeetingParams
): Promise<{ id: string; joinUrl: string } | null> {
  const accessToken = await getValidZoomAccessToken(userId);
  if (!accessToken) return null;

  const res = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic: params.topic,
      type: 2,
      start_time: params.startTimeIso,
      duration: params.durationMinutes,
      timezone: params.timezone ?? "Asia/Tokyo",
      agenda: params.agenda,
      settings: {
        join_before_host: false,
        waiting_room: true,
        approval_type: 2,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Zoom create meeting failed:", res.status, err);
    return null;
  }

  const data = (await res.json()) as { id?: number | string; join_url?: string };
  if (!data.id || !data.join_url) return null;
  return { id: String(data.id), joinUrl: data.join_url };
}
