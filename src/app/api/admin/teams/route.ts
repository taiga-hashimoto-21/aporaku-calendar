import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        owner: {
          select: { name: true, email: true },
        },
        _count: {
          select: {
            members: true,
            calendars: true,
          },
        },
      },
    });

    const rows = teams.map((team) => ({
      id: team.id,
      name: team.name,
      ownerName: team.owner.name,
      ownerEmail: team.owner.email,
      memberCount: team._count.members,
      calendarCount: team._count.calendars,
      createdAt: team.createdAt.toISOString(),
    }));

    return NextResponse.json({ teams: rows });
  } catch (error) {
    console.error("Admin teams GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
