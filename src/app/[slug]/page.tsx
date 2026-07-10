import { PublicBookingPage } from "@/components/public-booking-page";
import { isReservedSlug } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

function getJstDayFaviconPath(date = new Date()): string {
  const day = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tokyo",
      day: "numeric",
    }).format(date)
  );
  const safeDay = Number.isFinite(day) && day >= 1 && day <= 31 ? day : 1;
  return `/favicons/${safeDay}.ico`;
}

export function generateMetadata(): Metadata {
  return {
    icons: {
      icon: getJstDayFaviconPath(),
    },
  };
}

export default async function PublicCalendarRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (isReservedSlug(slug)) {
    notFound();
  }

  return (
    <main className="min-h-screen w-full bg-white px-4 pt-3 pb-6 sm:px-8 sm:pt-6 sm:pb-10">
      <PublicBookingPage slug={slug} />
    </main>
  );
}
