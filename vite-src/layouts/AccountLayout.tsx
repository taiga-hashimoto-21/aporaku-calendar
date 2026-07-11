import { Outlet } from "react-router-dom";
import { AccountSettingsNav } from "@/components/account-settings-nav";

export function AccountLayout() {
  return (
    <div className="flex-1 w-full bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-6 py-8 flex gap-8 items-start min-h-[calc(100vh-4.5rem)]">
        <AccountSettingsNav />
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
