import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { switchCurrentTeam } from "@/lib/team";
import { z } from "zod";

const switchSchema = z.object({
  teamId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = switchSchema.parse(body);
    const team = await switchCurrentTeam(session.user.id, parsed.teamId);

    return NextResponse.json({
      id: team.id,
      name: team.name,
      slug: team.slug,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Team not found") {
      return NextResponse.json({ error: "チームが見つかりません" }, { status: 404 });
    }
    console.error("Teams switch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
