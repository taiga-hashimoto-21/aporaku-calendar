import { NextRequest, NextResponse } from "next/server";

export function verifyAporakuAuth(request: NextRequest): boolean {
  const secret = process.env.APORAKU_API_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;

  return auth.slice(7) === secret;
}
