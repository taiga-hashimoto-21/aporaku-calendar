import { PublicBookingPage } from "@/components/public-booking-page";
import { resolvePublicSlug } from "@/lib/delivery-link";
import { isReservedSlug } from "@/lib/utils";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const icons = { icon: getJstDayFaviconPath() };

  if (isReservedSlug(slug)) {
    return { icons };
  }

  const resolved = await resolvePublicSlug(slug);
  if (!resolved) {
    return { icons };
  }

  const name =
    resolved.calendar.user.name?.trim() ||
    resolved.calendar.user.email.split("@")[0] ||
    "担当者";
  const duration = resolved.calendar.durationMinutes;

  return {
    title: `${name} と ${duration} 分間の予定`,
    icons,
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
    <main
      className={`${roboto.variable} font-public-booking min-h-screen w-full bg-white px-4 pt-3 pb-6 sm:px-8 sm:pt-6 sm:pb-10`}
    >
      <Suspense fallback={<p className="py-16 text-center text-sm text-gray-500">読み込み中...</p>}>
        <PublicBookingPage slug={slug} />
      </Suspense>
    </main>
  );
}
