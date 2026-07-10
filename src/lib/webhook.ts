import type { Booking, DeliveryLink, SchedulingCalendar } from "@prisma/client";
import { buildPublicUrl } from "@/lib/slug";

type BookingWithContext = Booking & {
  calendar: SchedulingCalendar;
  deliveryLink: DeliveryLink | null;
};

export async function sendAporakuWebhook(booking: BookingWithContext): Promise<void> {
  const webhookUrl = process.env.APORAKU_WEBHOOK_URL;
  if (!webhookUrl) return;

  const slug = booking.deliveryLink?.slug ?? booking.calendar.slug;
  const publicUrl = buildPublicUrl(slug);

  const payload = {
    webhook_type: "event_confirmed",
    calendar_url: publicUrl,
    calendar_url_path: slug,
    calendar_name: booking.calendar.name,
    delivery_link_slug: booking.deliveryLink?.slug ?? null,
    channel: booking.channel ?? booking.deliveryLink?.channel ?? null,
    pattern_id: booking.patternId ?? booking.deliveryLink?.patternId ?? null,
    company_id: booking.companyId ?? booking.deliveryLink?.companyId ?? null,
    company_name: booking.companyName ?? booking.deliveryLink?.companyName ?? null,
    company_domain: booking.companyDomain ?? booking.deliveryLink?.companyDomain ?? null,
    outreach_subject_id:
      booking.outreachSubjectId ?? booking.deliveryLink?.outreachSubjectId ?? null,
    event: {
      id: booking.id,
      start: booking.startAt.toISOString(),
      end: booking.endAt.toISOString(),
      url: publicUrl,
    },
    form: {
      name: booking.guestName,
      email: booking.guestEmail,
      company_name: booking.guestCompany ?? booking.companyName ?? null,
    },
    url_params: booking.deliveryLink?.slug
      ? [{ tid: booking.deliveryLink.slug }]
      : [],
    google_meet_url: booking.meetUrl ?? null,
    zoom_meeting_url: booking.zoomMeetingUrl ?? null,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = process.env.APORAKU_WEBHOOK_SECRET;
  if (token) {
    headers["x-schedule-authorization"] = token;
    headers["x-timerex-authorization"] = token;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Aporaku webhook failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Aporaku webhook error:", err);
  }
}
