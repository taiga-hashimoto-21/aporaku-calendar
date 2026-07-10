import { NextRequest, NextResponse } from "next/server";
import { verifyAporakuAuth } from "@/lib/aporaku-auth";
import {
  createDeliveryLink,
  resolveDefaultCalendarForAporakuUser,
} from "@/lib/delivery-link";
import { z } from "zod";

const createLinkSchema = z.object({
  aporakuUserId: z.string().min(1),
  calendarId: z.string().optional(),
  calendarSlug: z.string().optional(),
  channel: z.enum(["form", "email", "call"]),
  patternId: z.string().optional().nullable(),
  outreachSubjectId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  companyDomain: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  if (!verifyAporakuAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createLinkSchema.parse(body);

    let calendarId = parsed.calendarId;

    if (!calendarId && parsed.calendarSlug) {
      const { prisma } = await import("@/lib/prisma");
      const cal = await prisma.schedulingCalendar.findUnique({
        where: { slug: parsed.calendarSlug, isActive: true },
      });
      if (!cal) {
        return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
      }
      calendarId = cal.id;
    }

    if (!calendarId) {
      const defaultCal = await resolveDefaultCalendarForAporakuUser(parsed.aporakuUserId);
      if (!defaultCal) {
        return NextResponse.json(
          { error: "calendarId, calendarSlug, or linked aporakuUserId required" },
          { status: 400 }
        );
      }
      calendarId = defaultCal.id;
    }

    const link = await createDeliveryLink({
      calendarId,
      aporakuUserId: parsed.aporakuUserId,
      channel: parsed.channel,
      patternId: parsed.patternId,
      outreachSubjectId: parsed.outreachSubjectId,
      companyId: parsed.companyId,
      companyName: parsed.companyName,
      companyDomain: parsed.companyDomain,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Create delivery link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
