import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCurrentTeam } from "@/lib/team";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const currentTeam = await ensureCurrentTeam(session.user.id);

  const [dbUser, calendarCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        teamSlug: true,
        timezone: true,
        companyName: true,
      },
    }),
    prisma.schedulingCalendar.count({
      where: { teamId: currentTeam.id },
    }),
  ]);

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.id,
      name: dbUser?.name ?? session.user.name,
      email: dbUser?.email ?? session.user.email,
      image: dbUser?.image ?? session.user.image ?? null,
      teamSlug: dbUser?.teamSlug ?? session.user.teamSlug,
      timezone: dbUser?.timezone ?? session.user.timezone,
      companyName: dbUser?.companyName ?? null,
    },
    currentTeam: {
      id: currentTeam.id,
      name: currentTeam.name,
      slug: currentTeam.slug,
    },
    calendarCount,
  });
}
