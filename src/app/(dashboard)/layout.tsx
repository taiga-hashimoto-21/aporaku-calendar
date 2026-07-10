import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureCurrentTeam } from "@/lib/team";
import { DashboardHeader } from "@/components/dashboard-header";

async function handleSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

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
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        userName={userName}
        userImage={userImage}
        signOutAction={handleSignOut}
        currentTeam={{ id: currentTeam.id, name: currentTeam.name }}
      />
      <main className="flex-1 w-full flex flex-col">{children}</main>
    </div>
  );
}
