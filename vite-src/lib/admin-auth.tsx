import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AdminSessionResponse = {
  authenticated: boolean;
  email?: string;
};

type AdminAuthContextValue = {
  loading: boolean;
  authenticated: boolean;
  email: string | null;
  refreshSession: () => Promise<boolean>;
  clearSession: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { credentials: "include" });
      if (!res.ok) {
        setAuthenticated(false);
        setEmail(null);
        return false;
      }
      const data = (await res.json()) as AdminSessionResponse;
      if (!data.authenticated) {
        setAuthenticated(false);
        setEmail(null);
        return false;
      }
      setAuthenticated(true);
      setEmail(data.email ?? null);
      return true;
    } catch {
      setAuthenticated(false);
      setEmail(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setAuthenticated(false);
    setEmail(null);
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({
      loading,
      authenticated,
      email,
      refreshSession,
      clearSession,
    }),
    [loading, authenticated, email, refreshSession, clearSession]
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
