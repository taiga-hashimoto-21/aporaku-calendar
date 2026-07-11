import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteZoomConnection } from "@/lib/zoom";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteZoomConnection(session.user.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Zoom disconnect error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "連携解除に失敗しました" },
      { status: 500 }
    );
  }
}
