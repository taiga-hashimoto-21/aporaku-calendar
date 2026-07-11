import { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { DashboardFrameSkeleton } from "./DashboardFrameSkeleton";

export function ProtectedRoute() {
  const { loading, authenticated, needsCompanyOnboarding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginRedirectedRef = useRef(false);
  const onboardingRedirectedRef = useRef(false);

  const isOnboardingPath = location.pathname.startsWith("/onboarding");

  // /login は Next 側のため、クライアント遷移ではなくフルリロードで遷移する
  useEffect(() => {
    if (loading || authenticated || loginRedirectedRef.current) return;
    loginRedirectedRef.current = true;
    window.location.replace("/login");
  }, [loading, authenticated]);

  useEffect(() => {
    if (loading || !authenticated) return;

    if (needsCompanyOnboarding && !isOnboardingPath) {
      if (onboardingRedirectedRef.current) return;
      onboardingRedirectedRef.current = true;
      navigate("/onboarding/company", { replace: true });
      return;
    }

    if (!needsCompanyOnboarding && isOnboardingPath) {
      navigate("/dashboard", { replace: true });
    }
  }, [
    loading,
    authenticated,
    needsCompanyOnboarding,
    isOnboardingPath,
    navigate,
  ]);

  if (loading || !authenticated) {
    return <DashboardFrameSkeleton />;
  }

  if (needsCompanyOnboarding && !isOnboardingPath) {
    return <DashboardFrameSkeleton />;
  }

  return <Outlet />;
}
