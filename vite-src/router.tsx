import { createBrowserRouter, Navigate } from "react-router-dom";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AccountLayout } from "./layouts/AccountLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AppShell } from "./layouts/AppShell";
import { TeamLayout } from "./layouts/TeamLayout";
import { AccountCalendarPage } from "./pages/AccountCalendarPage";
import { AccountIntegrationsPage } from "./pages/AccountIntegrationsPage";
import { CalendarEditPage } from "./pages/CalendarEditPage";
import { CalendarNewPage } from "./pages/CalendarNewPage";
import { CompanyOnboardingPage } from "./pages/CompanyOnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { TeamPage } from "./pages/TeamPage";
import { AdminAccountsPage } from "./pages/admin/AdminAccountsPage";
import { AdminDocumentsPage } from "./pages/admin/AdminDocumentsPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminTeamsPage } from "./pages/admin/AdminTeamsPage";

export const router = createBrowserRouter([
  { path: "/admin/login", element: <AdminLoginPage /> },
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <Navigate to="/admin/accounts" replace /> },
          { path: "/admin/accounts", element: <AdminAccountsPage /> },
          { path: "/admin/teams", element: <AdminTeamsPage /> },
          { path: "/admin/documents", element: <AdminDocumentsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/onboarding/company", element: <CompanyOnboardingPage /> },
      {
        element: <AppShell />,
        children: [
          {
            element: <TeamLayout />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/dashboard/team", element: <TeamPage /> },
              { path: "/calendars/new", element: <CalendarNewPage /> },
              { path: "/calendars/:id/edit", element: <CalendarEditPage /> },
            ],
          },
          {
            element: <AccountLayout />,
            children: [
              { path: "/account/profile", element: <ProfilePage /> },
              { path: "/account/calendar", element: <AccountCalendarPage /> },
              { path: "/account/integrations", element: <AccountIntegrationsPage /> },
            ],
          },
          { path: "/account", element: <Navigate to="/account/profile" replace /> },
        ],
      },
    ],
  },
]);
