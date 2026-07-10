import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findAccessibleCalendar } from "@/lib/team";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  privateName: z.string().min(1).max(100).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  bufferBeforeMinutes: z.number().int().min(0).max(120).optional(),
  bufferAfterMinutes: z.number().int().min(0).max(120).optional(),
  bufferEventName: z.string().min(1).max(100).nullable().optional(),
  meetingType: z.enum(["none", "zoom", "google_meet"]).optional(),
  bookingWindowDays: z.number().int().min(1).max(365).optional(),
  minNoticeHours: z.number().int().min(0).max(168).optional(),
  isActive: z.boolean().optional(),
  weeklyAvailability: z.record(z.array(z.object({ start: z.string(), end: z.string() }))).optional(),
  participationMode: z.enum(["all", "any", "two_groups"]).optional(),
  participantIds: z.array(z.string().min(1)).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await findAccessibleCalendar(session.user.id, id);
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateSchema.parse(body);
    const { participantIds, ...calendarData } = parsed;

    const calendar = await prisma.$transaction(async (tx) => {
      const updated = await tx.schedulingCalendar.update({
        where: { id },
        data: calendarData,
      });

      if (participantIds !== undefined) {
        const teamMemberIds = new Set(
          (
            await tx.teamMember.findMany({
              where: { teamId: existing.teamId },
              select: { userId: true },
            })
          ).map((m) => m.userId)
        );

        let nextIds = [...new Set(participantIds)].filter((uid) => teamMemberIds.has(uid));
        if (nextIds.length === 0) {
          nextIds = [session.user!.id];
        }

        await tx.calendarParticipant.deleteMany({ where: { calendarId: id } });
        await tx.calendarParticipant.createMany({
          data: nextIds.map((userId) => ({ calendarId: id, userId })),
        });
      }

      return updated;
    });

    return NextResponse.json({ calendar });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Calendar update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await findAccessibleCalendar(session.user.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.schedulingCalendar.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
