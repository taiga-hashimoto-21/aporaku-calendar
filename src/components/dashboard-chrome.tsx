"use client";

import { DashboardHeader } from "@/components/dashboard-header";

type Props = {
  userName: string;
  userImage: string | null | undefined;
  currentTeam: { id: string; name: string };
  children: React.ReactNode;
};

export function DashboardChrome({ userName, userImage, currentTeam, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader
        userName={userName}
        userImage={userImage}
        currentTeam={currentTeam}
        onSignOut={() => {
          void (async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
            } catch {
              // ignore
            }
            window.location.href = "/login";
          })();
        }}
      />
      <main className="flex-1 w-full flex flex-col">{children}</main>
    </div>
  );
}
