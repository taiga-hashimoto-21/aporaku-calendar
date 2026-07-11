import { prisma } from "@/lib/prisma";
import {
  BOOKING_EMAIL_TEMPLATE_KEYS,
  DEFAULT_BOOKING_EMAIL_TEMPLATES,
  type BookingEmailTemplateKey,
} from "@/lib/booking-email-templates";

const LEGACY_TEMPLATE_KEYS = [
  "form_guest",
  "form_host",
  "email_guest",
  "email_host",
  "call_guest",
  "call_host",
] as const;

export async function ensureBookingEmailTemplates() {
  const existing = await prisma.bookingEmailTemplate.findMany({
    select: { key: true, subject: true, body: true },
  });
  const byKey = new Map(existing.map((t) => [t.key, t]));

  for (const def of DEFAULT_BOOKING_EMAIL_TEMPLATES) {
    if (byKey.has(def.key)) continue;

    // 旧 form_* にユーザー編集があれば引き継ぐ
    const legacy = byKey.get(`form_${def.audience}`);
    let subject = def.subject;
    let body = def.body;
    if (legacy) {
      subject = legacy.subject;
      body = legacy.body.replace(/経由:\s*フォーム営業/g, "{経由}");
    }

    await prisma.bookingEmailTemplate.create({
      data: {
        key: def.key,
        channel: "all",
        audience: def.audience,
        subject,
        body,
      },
    });
  }

  await prisma.bookingEmailTemplate.deleteMany({
    where: { key: { in: [...LEGACY_TEMPLATE_KEYS] } },
  });
}

export async function listBookingEmailTemplates() {
  await ensureBookingEmailTemplates();
  const rows = await prisma.bookingEmailTemplate.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return BOOKING_EMAIL_TEMPLATE_KEYS.map((key) => {
    const row = byKey.get(key);
    const fallback = DEFAULT_BOOKING_EMAIL_TEMPLATES.find((t) => t.key === key)!;
    return {
      key: key as BookingEmailTemplateKey,
      audience: (row?.audience ?? fallback.audience) as "guest" | "host",
      subject: row?.subject ?? fallback.subject,
      body: row?.body ?? fallback.body,
      updatedAt: row?.updatedAt?.toISOString() ?? null,
    };
  });
}
