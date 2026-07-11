import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "氏名を入力してください").max(100),
  companyName: z
    .string()
    .trim()
    .min(1, "会社名を入力してください")
    .max(200),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name ?? "",
    email: user.email,
    companyName: user.companyName ?? "",
  });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = schema.parse(body);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.name,
        companyName: parsed.companyName,
      },
      select: { name: true, email: true, companyName: true },
    });

    return NextResponse.json({
      name: user.name,
      email: user.email,
      companyName: user.companyName ?? "",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
