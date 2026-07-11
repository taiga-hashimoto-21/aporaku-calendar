import { Outlet } from "react-router-dom";
import { TeamSettingsLayout } from "@/components/team-settings-layout";

export function TeamLayout() {
  return (
    <TeamSettingsLayout>
      <Outlet />
    </TeamSettingsLayout>
  );
}
