import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  ensureCurrentTeam,
  ensureTeamInviteLink,
  listTeamMembers,
  reissueTeamInviteLink,
} from "@/lib/team";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const team = await ensureCurrentTeam(session.user.id);
    const members = await listTeamMembers(team.id);
    const isOwner = team.ownerUserId === session.user.id;

    return NextResponse.json({
      teamId: team.id,
      teamName: team.name,
      isOwner,
      members,
    });
  } catch (error) {
    console.error("Team members GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { reissue?: boolean };
    const team = await ensureCurrentTeam(session.user.id);

    const result = body.reissue
      ? await reissueTeamInviteLink(session.user.id, team.id)
      : await ensureTeamInviteLink(session.user.id, team.id);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { error: "招待リンクを作成する権限がありません" },
        { status: 403 }
      );
    }
    console.error("Team invite POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
