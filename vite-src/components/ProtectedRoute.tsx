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
    const callback = `${location.pathname}${location.search}`;
    const loginUrl =
      callback.startsWith("/") && !callback.startsWith("//")
        ? `/login?callbackUrl=${encodeURIComponent(callback)}`
        : "/login";
    window.location.replace(loginUrl);
  }, [loading, authenticated, location.pathname, location.search]);

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

  // 未ログインは middleware で /login へ送る。ここは Cookie 切れ等のフォールバック。
  // 未ログイン確定後はスケルトンを出さず、リダイレクトまで何も描画しない。
  if (!authenticated) {
    if (loading) return <DashboardFrameSkeleton />;
    return null;
  }

  if (needsCompanyOnboarding && !isOnboardingPath) {
    return <DashboardFrameSkeleton />;
  }

  return <Outlet />;
}
