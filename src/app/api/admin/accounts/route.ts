import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            teamMemberships: true,
            calendars: true,
          },
        },
      },
    });

    const accounts = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      teamCount: user._count.teamMemberships,
      calendarCount: user._count.calendars,
      createdAt: user.createdAt.toISOString(),
    }));

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Admin accounts GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
