import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
}

function getSessionSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function encodeSession(email: string, expiresAt: number): string {
  const payload = `${email}:${expiresAt}`;
  return `${payload}.${signPayload(payload)}`;
}

function decodeSession(token: string): { email: string; expiresAt: number } | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expected = signPayload(payload);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const sep = payload.lastIndexOf(":");
  if (sep <= 0) return null;
  const email = payload.slice(0, sep);
  const expiresAt = Number(payload.slice(sep + 1));
  if (!email || !Number.isFinite(expiresAt)) return null;
  if (Date.now() > expiresAt) return null;
  return { email, expiresAt };
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const expectedEmail = getAdminEmail();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!expectedEmail || !passwordHash) return false;

  const normalized = email.trim().toLowerCase();
  if (normalized !== expectedEmail) return false;

  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}

export async function createAdminSessionCookie(email: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const token = encodeSession(email.trim().toLowerCase(), expiresAt);
  const jar = await cookies();
  jar.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const decoded = decodeSession(token);
  if (!decoded) return null;
  if (decoded.email !== getAdminEmail()) return null;
  return { email: decoded.email };
}

export async function requireAdminSession(): Promise<{ email: string }> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
