import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSessionCookie,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("メールアドレスの形式が正しくありません"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const ok = await verifyAdminCredentials(parsed.email, parsed.password);
    if (!ok) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません" },
        { status: 401 }
      );
    }

    await createAdminSessionCookie(parsed.email);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
