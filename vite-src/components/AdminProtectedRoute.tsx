import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../lib/admin-auth";
import { AdminFrameSkeleton } from "./AdminFrameSkeleton";

export function AdminProtectedRoute() {
  const { loading, authenticated } = useAdminAuth();
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (loading || authenticated || redirectedRef.current) return;
    redirectedRef.current = true;
    navigate("/admin/login", { replace: true });
  }, [loading, authenticated, navigate]);

  if (loading || !authenticated) {
    return <AdminFrameSkeleton />;
  }

  return <Outlet />;
}
