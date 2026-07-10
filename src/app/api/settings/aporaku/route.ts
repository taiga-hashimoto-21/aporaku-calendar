import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  aporakuUserId: z.string().min(1).max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { aporakuUserId: true },
  });

  return NextResponse.json({ aporakuUserId: user?.aporakuUserId ?? null });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { aporakuUserId: parsed.aporakuUserId },
    });
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "このアポラクユーザー ID は既に別アカウントに紐付いています" },
        { status: 409 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { aporakuUserId: parsed.aporakuUserId },
      select: { aporakuUserId: true },
    });

    return NextResponse.json({ aporakuUserId: user.aporakuUserId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Aporaku link update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
