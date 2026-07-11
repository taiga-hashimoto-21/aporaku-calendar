import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

/** SPA からのログアウト用（リダイレクトなし） */
export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.json({ ok: true });
}
