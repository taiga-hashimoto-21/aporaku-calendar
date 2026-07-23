import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createGoogleCalendarEvent } from "@/lib/google-calendar";
import { resolvePublicSlug } from "@/lib/delivery-link";
import { invalidateSlotsCache } from "@/lib/slots-cache";
import { sendAporakuWebhook } from "@/lib/webhook";
import { createZoomMeeting } from "@/lib/zoom";
import { z } from "zod";

const bookingSchema = z.object({
  slug: z.string().min(1),
  startAt: z.string().datetime(),
  guestName: z.string().min(1).max(100),
  guestEmail: z.string().email(),
  guestCompany: z.string().max(200).optional(),
  answers: z
    .array(
      z.object({
        fieldId: z.string().optional(),
        label: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bookingSchema.parse(body);

    const resolved = await resolvePublicSlug(parsed.slug);
    if (!resolved) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const calendar = resolved.calendar;
    const deliveryLink = resolved.deliveryLink;

    const startAt = new Date(parsed.startAt);
    const endAt = new Date(startAt.getTime() + calendar.durationMinutes * 60 * 1000);

    const booking = await prisma.booking.create({
      data: {
        calendarId: calendar.id,
        startAt,
        endAt,
        guestName: parsed.guestName,
        guestEmail: parsed.guestEmail,
        guestCompany: parsed.guestCompany ?? deliveryLink?.companyName ?? null,
        deliveryLinkId: deliveryLink?.id ?? null,
        channel: deliveryLink?.channel ?? null,
        patternId: deliveryLink?.patternId ?? null,
        outreachSubjectId: deliveryLink?.outreachSubjectId ?? null,
        companyId: deliveryLink?.companyId ?? null,
        companyName: deliveryLink?.companyName ?? null,
        companyDomain: deliveryLink?.companyDomain ?? null,
        answers: parsed.answers
          ? {
              create: parsed.answers.map((a) => ({
                fieldId: a.fieldId ?? null,
                label: a.label,
                value: a.value,
              })),
            }
          : undefined,
      },
      include: {
        calendar: true,
        deliveryLink: true,
      },
    });

    if (deliveryLink) {
      await prisma.deliveryLink.update({
        where: { id: deliveryLink.id },
        data: { bookedAt: new Date() },
      });
    }

    // Zoom カレンダーの場合、予約確定時にミーティングを発行して join URL を保存する
    if (calendar.meetingType === "zoom") {
      try {
        const zoomMeeting = await createZoomMeeting(calendar.user.id, {
          topic: `${calendar.name} - ${parsed.guestName}`,
          startTimeIso: booking.startAt.toISOString(),
          durationMinutes: calendar.durationMinutes,
          timezone: calendar.timezone,
          agenda: [
            parsed.guestCompany ? `Company: ${parsed.guestCompany}` : null,
            `Guest: ${parsed.guestName} <${parsed.guestEmail}>`,
          ]
            .filter(Boolean)
            .join("\n"),
        });

        if (zoomMeeting) {
          const updated = await prisma.booking.update({
            where: { id: booking.id },
            data: {
              zoomMeetingId: zoomMeeting.id,
              zoomMeetingUrl: zoomMeeting.joinUrl,
            },
            include: {
              calendar: true,
              deliveryLink: true,
            },
          });
          Object.assign(booking, updated);
        }
      } catch (err) {
        console.error("Zoom meeting creation failed:", err);
      }
    }

    try {
      const event = await createGoogleCalendarEvent({
        userId: calendar.user.id,
        calendar,
        booking,
        guestEmail: parsed.guestEmail,
        guestName: parsed.guestName,
      });

      if (event) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            googleEventId: event.eventId,
            meetUrl: event.meetUrl ?? null,
          },
        });
        booking.googleEventId = event.eventId;
        booking.meetUrl = event.meetUrl ?? null;
      }
    } catch (err) {
      console.error("Google Calendar event creation failed:", err);
    }

    // 予約が入った枠を次の閲覧者に見せないよう、このカレンダーの空き枠キャッシュを破棄する
    // (Google イベント作成後に行うことで、再計算時の freebusy に今回の予約が反映される)。
    await invalidateSlotsCache(calendar.id);

    await sendAporakuWebhook(booking);

    return NextResponse.json(
      {
        bookingId: booking.id,
        startAt: booking.startAt.toISOString(),
        endAt: booking.endAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Booking create error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
