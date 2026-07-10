import Sqids from "sqids";
import { prisma } from "@/lib/prisma";
import { isReservedSlug } from "@/lib/utils";

let sqidsInstance: Sqids | null = null;

function getSqids(): Sqids {
  if (sqidsInstance) return sqidsInstance;

  const alphabet =
    process.env.SQIDS_ALPHABET ??
    (process.env.NODE_ENV === "development"
      ? "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      : undefined);

  if (!alphabet) {
    throw new Error(
      "SQIDS_ALPHABET 環境変数が未設定です。.env に設定してください（アポラクと同一の alphabet を推奨）。"
    );
  }

  sqidsInstance = new Sqids({ alphabet, minLength: 8 });
  return sqidsInstance;
}

/**
 * 衝突ゼロの公開 slug を生成（カレンダー・配信リンク共通）
 */
export async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const seq = await prisma.slugSequence.create({
      data: {},
      select: { id: true },
    });
    const slug = getSqids().encode([seq.id]);

    if (isReservedSlug(slug)) continue;

    const [calendarConflict, linkConflict] = await Promise.all([
      prisma.schedulingCalendar.findUnique({ where: { slug }, select: { id: true } }),
      prisma.deliveryLink.findUnique({ where: { slug }, select: { id: true } }),
    ]);

    if (!calendarConflict && !linkConflict) {
      return slug;
    }
  }

  throw new Error("slug の生成に失敗しました（衝突が続いています）");
}

import { buildPublicCalendarUrl } from "@/lib/utils";

export function buildPublicUrl(slug: string): string {
  return buildPublicCalendarUrl(slug);
}
