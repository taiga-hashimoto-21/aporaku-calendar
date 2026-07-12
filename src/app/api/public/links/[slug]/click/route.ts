import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 配信リンクのクリック記録 (公開ページが表示時に 1 回だけ sendBeacon で叩く)。
 *
 * 以前は空き枠 API (GET /api/public/calendars/[slug]) が呼ばれるたびに記録していたが、
 * それだと月移動のたびに二重計上され、かつ記録の DB 書き込みが空き枠応答をブロックしていた。
 * カレンダー slug (配信リンクでない) の場合は何もしない。
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const link = await prisma.deliveryLink.findUnique({
      where: { slug },
      select: { id: true, clickedAt: true },
    });
    if (link) {
      await prisma.deliveryLink.update({
        where: { id: link.id },
        data: {
          clickCount: { increment: 1 },
          clickedAt: link.clickedAt ?? new Date(),
        },
      });
    }
  } catch (err) {
    console.warn("click record failed:", err);
  }
  // 記録できなくても公開ページには影響させない
  return NextResponse.json({ ok: true });
}
