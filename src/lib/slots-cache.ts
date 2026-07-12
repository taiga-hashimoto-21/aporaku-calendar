import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlotsForDateRange } from "@/lib/calendar-slots";
import { parseDateKey } from "@/lib/booking-timezone";
import type { CalendarWithOwner } from "@/lib/delivery-link";

/**
 * 公開ページの空き枠キャッシュ (PublicSlotsCache テーブル)。
 *
 * 公開ページの遅さの主因は表示のたびに走る Google freebusy + 直列 DB 往復なので、
 * 計算結果を (calendarId, fromKey, days) 単位で保持して再利用する。
 * - FRESH_MS 以内: そのまま返す (Google API 0回)
 * - STALE_MS 以内: そのまま返しつつ、レスポンス後 (after) に裏で再計算して更新 (SWR)
 * - それ以降 / 未キャッシュ: その場で計算して保存
 * 予約成立・カレンダー設定変更時は invalidateSlotsCache で該当カレンダー分を全消しする。
 */

export type SerializedSlotsByDate = Record<
  string,
  Array<{ start: string; end: string }>
>;

const FRESH_MS = 60 * 1000;
const STALE_MS = 15 * 60 * 1000;

function serializeSlots(
  byDate: Record<string, Array<{ start: Date; end: Date }>>
): SerializedSlotsByDate {
  const out: SerializedSlotsByDate = {};
  for (const [dateKey, daySlots] of Object.entries(byDate)) {
    out[dateKey] = daySlots.map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
    }));
  }
  return out;
}

/**
 * キャッシュ経過中に「今から◯時間前まで」の締切 (minNoticeHours) を跨いだスロットを
 * 配信時点で落とす。 キャッシュが最大 STALE_MS 古くても、 予約できない過去枠は出さない。
 */
function dropExpiredSlots(
  payload: SerializedSlotsByDate,
  minNoticeHours: number
): SerializedSlotsByDate {
  const cutoff = Date.now() + Math.max(0, minNoticeHours) * 3600_000;
  const out: SerializedSlotsByDate = {};
  for (const [dateKey, daySlots] of Object.entries(payload)) {
    out[dateKey] = daySlots.filter((slot) => Date.parse(slot.start) >= cutoff);
  }
  return out;
}

async function computeAndStore(
  calendar: CalendarWithOwner,
  fromKey: string,
  days: number
): Promise<SerializedSlotsByDate> {
  const fromDate = parseDateKey(fromKey, calendar.timezone);
  const slotsByDate = await getAvailableSlotsForDateRange(calendar, fromDate, days);
  const payload = serializeSlots(slotsByDate);
  try {
    await prisma.publicSlotsCache.upsert({
      where: {
        calendarId_fromKey_days: { calendarId: calendar.id, fromKey, days },
      },
      create: { calendarId: calendar.id, fromKey, days, payload },
      update: { payload },
    });
  } catch (err) {
    // キャッシュ保存の失敗は応答に影響させない (次回また計算するだけ)
    console.warn("PublicSlotsCache upsert failed:", err);
  }
  return payload;
}

export async function getPublicSlots(
  calendar: CalendarWithOwner,
  fromKey: string,
  days: number
): Promise<SerializedSlotsByDate> {
  try {
    const cached = await prisma.publicSlotsCache.findUnique({
      where: {
        calendarId_fromKey_days: { calendarId: calendar.id, fromKey, days },
      },
    });
    if (cached) {
      const age = Date.now() - cached.updatedAt.getTime();
      const payload = cached.payload as SerializedSlotsByDate;
      if (age < FRESH_MS) {
        return dropExpiredSlots(payload, calendar.minNoticeHours);
      }
      if (age < STALE_MS) {
        // 古い値を即返して、レスポンス送信後に裏で更新する (stale-while-revalidate)
        after(async () => {
          try {
            await computeAndStore(calendar, fromKey, days);
          } catch (err) {
            console.warn("slots cache revalidate failed:", err);
          }
        });
        return dropExpiredSlots(payload, calendar.minNoticeHours);
      }
    }
  } catch (err) {
    console.warn("PublicSlotsCache read failed:", err);
  }
  // 未キャッシュ / 期限切れ / キャッシュ障害 → その場で計算 (生成時に minNotice 適用済み)
  return computeAndStore(calendar, fromKey, days);
}

/**
 * 予約成立・カレンダー設定変更時に呼ぶ。 失敗しても致命的ではない (TTL で自然失効する)。
 * await しない fire-and-forget 用に void を返すが、 Vercel ではレスポンス前に呼ぶこと
 * (レスポンス後の実行は打ち切られるため、 レスポンス後に回したい場合は after を使う)。
 */
export async function invalidateSlotsCache(calendarId: string): Promise<void> {
  try {
    await prisma.publicSlotsCache.deleteMany({ where: { calendarId } });
  } catch (err) {
    console.warn("PublicSlotsCache invalidate failed:", err);
  }
}
