import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureCurrentTeam } from "@/lib/team";
import { DashboardChrome } from "@/components/dashboard-chrome";

/** Next 側フォールバック用（本番は middleware で SPA に rewrite） */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [user, currentTeam] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, image: true },
    }),
    ensureCurrentTeam(session.user.id),
  ]);

  const userName = user?.name ?? session.user.name ?? session.user.email ?? "ユーザー";
  const userImage = user?.image ?? session.user.image;

  return (
    <DashboardChrome
      userName={userName}
      userImage={userImage}
      currentTeam={{ id: currentTeam.id, name: currentTeam.name }}
    >
      {children}
    </DashboardChrome>
  );
}
