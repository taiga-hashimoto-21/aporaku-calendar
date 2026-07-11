import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "../lib/auth";

export function AppShell() {
  const { user, currentTeam, signOut, setCurrentTeam } = useAuth();

  const userName = user?.name ?? user?.email ?? "ユーザー";
  const userImage = user?.image ?? null;
  const team = currentTeam ?? { id: "", name: "" };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        userName={userName}
        userImage={userImage}
        onSignOut={() => {
          void signOut();
        }}
        currentTeam={team}
        onTeamChange={setCurrentTeam}
      />
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
