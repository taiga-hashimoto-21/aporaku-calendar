import { TeamSettingsLayout } from "@/components/team-settings-layout";

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return <TeamSettingsLayout>{children}</TeamSettingsLayout>;
}
