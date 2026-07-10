import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createTeamForUser,
  ensureCurrentTeam,
  listTeamsForUser,
} from "@/lib/team";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1, "チーム名を入力してください").max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [teams, current] = await Promise.all([
      listTeamsForUser(session.user.id),
      ensureCurrentTeam(session.user.id),
    ]);

    return NextResponse.json({
      teams,
      currentTeamId: current.id,
    });
  } catch (error) {
    console.error("Teams GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.parse(body);
    const team = await createTeamForUser(session.user.id, parsed);

    return NextResponse.json(
      {
        id: team.id,
        name: team.name,
        slug: team.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes("チーム名")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Teams POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
