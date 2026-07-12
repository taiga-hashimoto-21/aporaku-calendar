import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [googleAccount, zoom, googleConnection, user] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
      select: { providerAccountId: true },
    }),
    prisma.zoomConnection.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
    prisma.googleConnection.findUnique({
      where: { userId: session.user.id },
      select: { calendarId: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    }),
  ]);

  return NextResponse.json({
    googleConnected: Boolean(googleAccount),
    googleEmail: googleAccount ? (user?.email ?? session.user.email ?? null) : null,
    googleCalendarId: googleConnection?.calendarId ?? "primary",
    zoomConnected: Boolean(zoom),
  });
}
