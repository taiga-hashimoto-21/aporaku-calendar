import { TeamSettingsNav } from "@/components/team-settings-nav";

export function TeamSettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 flex gap-8 items-start min-h-[calc(100vh-4.5rem)]">
        <TeamSettingsNav />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
