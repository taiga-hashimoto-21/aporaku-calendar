import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCurrentTeam } from "@/lib/team";
import { CREATE_DEFAULT_WEEKLY_AVAILABILITY } from "@/lib/schedule-candidate-settings";
import { buildPublicCalendarUrl } from "@/lib/utils";
import { generateUniqueSlug } from "@/lib/slug";
import { z } from "zod";

const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

const createSchema = z.object({
  name: z.string().min(1).max(100),
  privateName: z.string().min(1).max(100).nullable().optional(),
  durationMinutes: z.number().int().min(5).max(480).default(30),
  bufferBeforeMinutes: z.number().int().min(0).max(120).default(0),
  bufferAfterMinutes: z.number().int().min(0).max(120).default(0),
  bufferEventName: z.string().min(1).max(100).nullable().optional(),
  timezone: z.string().min(1).max(100).default("Asia/Tokyo"),
  weeklyAvailability: z
    .record(z.array(timeSlotSchema))
    .default(CREATE_DEFAULT_WEEKLY_AVAILABILITY),
  dateOverrides: z
    .array(
      z.object({
        date: z.string(),
        slots: z.array(timeSlotSchema),
        closed: z.boolean().optional(),
      })
    )
    .default([]),
  acceptHolidayBookings: z.boolean().default(false),
  bookingWindowDays: z.number().int().min(1).max(365).default(60),
  minNoticeHours: z.number().int().min(0).max(168).default(12),
  participationMode: z.enum(["all", "any", "two_groups"]).default("all"),
  participantIds: z.array(z.string().min(1)).default([]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentTeam = await ensureCurrentTeam(session.user.id);
  const calendars = await prisma.schedulingCalendar.findMany({
    where: { teamId: currentTeam.id },
    orderBy: { createdAt: "desc" },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.AUTH_URL ?? "http://localhost:3002";

  return NextResponse.json({
    calendars: calendars.map((cal) => ({
      ...cal,
      publicUrl: buildPublicCalendarUrl(cal.slug, baseUrl),
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.parse(body);
    const slug = await generateUniqueSlug();
    const currentTeam = await ensureCurrentTeam(session.user.id);

    const teamMemberIds = new Set(
      (
        await prisma.teamMember.findMany({
          where: { teamId: currentTeam.id },
          select: { userId: true },
        })
      ).map((m) => m.userId)
    );

    const requestedIds =
      parsed.participantIds.length > 0 ? parsed.participantIds : [session.user.id];
    let participantIds = [...new Set(requestedIds)].filter((id) => teamMemberIds.has(id));
    if (participantIds.length === 0) {
      participantIds = [session.user.id];
    }

    const calendar = await prisma.schedulingCalendar.create({
      data: {
        userId: session.user.id,
        teamId: currentTeam.id,
        slug,
        name: parsed.name,
        privateName: parsed.privateName ?? null,
        durationMinutes: parsed.durationMinutes,
        bufferBeforeMinutes: parsed.bufferBeforeMinutes,
        bufferAfterMinutes: parsed.bufferAfterMinutes,
        bufferEventName: parsed.bufferEventName ?? null,
        timezone: parsed.timezone,
        weeklyAvailability: parsed.weeklyAvailability as object,
        dateOverrides: parsed.dateOverrides as object,
        acceptHolidayBookings: parsed.acceptHolidayBookings,
        bookingWindowDays: parsed.bookingWindowDays,
        minNoticeHours: parsed.minNoticeHours,
        meetingType: "none",
        participationMode: parsed.participationMode,
        participants: {
          create: participantIds.map((userId) => ({ userId })),
        },
      },
    });

    return NextResponse.json(
      {
        id: calendar.id,
        slug: calendar.slug,
        publicUrl: buildPublicCalendarUrl(calendar.slug),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Calendar create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
