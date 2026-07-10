import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCurrentTeam } from "@/lib/team";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().trim().min(1, "チーム名を入力してください").max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const team = await ensureCurrentTeam(session.user.id);
    return NextResponse.json({
      id: team.id,
      name: team.name,
      slug: team.slug,
    });
  } catch (error) {
    console.error("Team GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.parse(body);

    const team = await ensureCurrentTeam(session.user.id);
    if (team.ownerUserId !== session.user.id) {
      return NextResponse.json(
        { error: "チーム設定を変更する権限がありません" },
        { status: 403 }
      );
    }

    const updated = await prisma.team.update({
      where: { id: team.id },
      data: { name: parsed.name },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Team PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
