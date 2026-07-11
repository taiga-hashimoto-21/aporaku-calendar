import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_EMAIL_TEMPLATE_KEYS,
  type BookingEmailTemplateKey,
} from "@/lib/booking-email-templates";
import { listBookingEmailTemplates } from "@/lib/booking-email-template-store";
import { z } from "zod";

const updateSchema = z.object({
  key: z.enum(
    BOOKING_EMAIL_TEMPLATE_KEYS as unknown as [
      BookingEmailTemplateKey,
      ...BookingEmailTemplateKey[],
    ]
  ),
  subject: z.string().trim().min(1, "件名を入力してください").max(200),
  body: z.string().trim().min(1, "本文を入力してください").max(20000),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const templates = await listBookingEmailTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Admin documents GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.parse(body);
    const audience = parsed.key;

    const row = await prisma.bookingEmailTemplate.upsert({
      where: { key: parsed.key },
      create: {
        key: parsed.key,
        channel: "all",
        audience,
        subject: parsed.subject,
        body: parsed.body,
      },
      update: {
        subject: parsed.subject,
        body: parsed.body,
      },
    });

    return NextResponse.json({
      template: {
        key: row.key,
        audience: row.audience,
        subject: row.subject,
        body: row.body,
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Admin documents PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
