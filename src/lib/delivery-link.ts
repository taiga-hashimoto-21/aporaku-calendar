import { prisma } from "@/lib/prisma";
import { generateUniqueSlug, buildPublicUrl } from "@/lib/slug";
import type { DeliveryLink, SchedulingCalendar } from "@prisma/client";

export type CalendarWithOwner = SchedulingCalendar & {
  user: { id: string; name: string | null; email: string; image: string | null };
  customFields: Array<{
    id: string;
    label: string;
    fieldType: string;
    required: boolean;
    options: unknown;
    sortOrder: number;
  }>;
};

export type ResolvedPublicSlug =
  | { kind: "calendar"; calendar: CalendarWithOwner; deliveryLink: null }
  | { kind: "delivery"; calendar: CalendarWithOwner; deliveryLink: DeliveryLink };

const calendarInclude = {
  customFields: { orderBy: { sortOrder: "asc" as const } },
  user: { select: { id: true, name: true, email: true, image: true } },
};

/**
 * 公開 slug を DeliveryLink → SchedulingCalendar の順で解決
 */
export async function resolvePublicSlug(
  slug: string,
  options?: { recordClick?: boolean }
): Promise<ResolvedPublicSlug | null> {
  const deliveryLink = await prisma.deliveryLink.findUnique({
    where: { slug },
    include: {
      calendar: { include: calendarInclude },
    },
  });

  if (deliveryLink) {
    if (!deliveryLink.calendar.isActive) return null;

    if (options?.recordClick) {
      await prisma.deliveryLink.update({
        where: { id: deliveryLink.id },
        data: {
          clickCount: { increment: 1 },
          clickedAt: deliveryLink.clickedAt ?? new Date(),
        },
      });
    }

    return {
      kind: "delivery",
      calendar: deliveryLink.calendar,
      deliveryLink,
    };
  }

  const calendar = await prisma.schedulingCalendar.findUnique({
    where: { slug, isActive: true },
    include: calendarInclude,
  });

  if (!calendar) return null;

  return { kind: "calendar", calendar, deliveryLink: null };
}

export async function createDeliveryLink(params: {
  calendarId: string;
  aporakuUserId: string;
  channel: "form" | "email" | "call";
  patternId?: string | null;
  outreachSubjectId?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  companyDomain?: string | null;
}): Promise<{ slug: string; url: string; id: string }> {
  const calendar = await prisma.schedulingCalendar.findUnique({
    where: { id: params.calendarId, isActive: true },
    include: { user: { select: { aporakuUserId: true } } },
  });

  if (!calendar) {
    throw new Error("カレンダーが見つかりません");
  }

  if (
    calendar.user.aporakuUserId &&
    calendar.user.aporakuUserId !== params.aporakuUserId
  ) {
    throw new Error("aporakuUserId がカレンダーオーナーと一致しません");
  }

  const slug = await generateUniqueSlug();

  const link = await prisma.deliveryLink.create({
    data: {
      slug,
      calendarId: params.calendarId,
      aporakuUserId: params.aporakuUserId,
      channel: params.channel,
      patternId: params.patternId ?? null,
      outreachSubjectId: params.outreachSubjectId ?? null,
      companyId: params.companyId ?? null,
      companyName: params.companyName ?? null,
      companyDomain: params.companyDomain ?? null,
    },
  });

  return { slug: link.slug, url: buildPublicUrl(link.slug), id: link.id };
}

/**
 * aporakuUserId からデフォルトカレンダー（最古のアクティブカレンダー）を解決
 */
export async function resolveDefaultCalendarForAporakuUser(
  aporakuUserId: string
): Promise<SchedulingCalendar | null> {
  const user = await prisma.user.findUnique({
    where: { aporakuUserId },
  });
  if (!user) return null;

  return prisma.schedulingCalendar.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });
}
