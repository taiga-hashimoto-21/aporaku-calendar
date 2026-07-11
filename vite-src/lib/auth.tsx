import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { writeCalendarCountHint } from "./calendar-count-hint";

export type AuthUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  teamSlug?: string | null;
  timezone?: string | null;
  companyName?: string | null;
};

export type AuthTeam = {
  id: string;
  name: string;
  slug?: string;
};

type SessionResponse = {
  authenticated: boolean;
  user?: AuthUser;
  currentTeam?: AuthTeam;
  calendarCount?: number;
};

type TeamChangeDetail = {
  id: string;
  name: string;
  calendarCount?: number;
};

type AuthContextValue = {
  loading: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  currentTeam: AuthTeam | null;
  /** 現在チームのカレンダー件数（session / チーム切替時に確定。スケルトン分岐用） */
  calendarCount: number;
  teamVersion: number;
  /** 会社名未設定なら初回オンボーディングが必要 */
  needsCompanyOnboarding: boolean;
  refreshSession: () => Promise<void>;
  setCurrentTeam: (team: { id: string; name: string; calendarCount?: number }) => void;
  setCalendarCount: (count: number) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentTeam, setCurrentTeamState] = useState<AuthTeam | null>(null);
  const [calendarCount, setCalendarCountState] = useState(0);
  const [teamVersion, setTeamVersion] = useState(0);

  const applyCalendarCount = useCallback((count: number) => {
    const next = Math.max(0, count);
    setCalendarCountState(next);
    writeCalendarCountHint(next);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      if (!res.ok) {
        setAuthenticated(false);
        setUser(null);
        setCurrentTeamState(null);
        setCalendarCountState(0);
        return;
      }
      const data = (await res.json()) as SessionResponse;
      if (!data.authenticated || !data.user) {
        setAuthenticated(false);
        setUser(null);
        setCurrentTeamState(null);
        setCalendarCountState(0);
        return;
      }
      setAuthenticated(true);
      setUser(data.user);
      setCurrentTeamState(data.currentTeam ?? null);
      applyCalendarCount(
        typeof data.calendarCount === "number" ? data.calendarCount : 0
      );
    } catch {
      setAuthenticated(false);
      setUser(null);
      setCurrentTeamState(null);
      setCalendarCountState(0);
    } finally {
      setLoading(false);
    }
  }, [applyCalendarCount]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    function onTeamChanged(event: Event) {
      const detail = (event as CustomEvent<TeamChangeDetail>).detail;
      if (detail?.id) {
        setCurrentTeamState((prev) => ({
          id: detail.id,
          name: detail.name,
          slug: prev?.slug,
        }));
        if (typeof detail.calendarCount === "number") {
          applyCalendarCount(detail.calendarCount);
        }
      }
      setTeamVersion((v) => v + 1);
    }
    window.addEventListener("team-changed", onTeamChanged);
    return () => window.removeEventListener("team-changed", onTeamChanged);
  }, [applyCalendarCount]);

  const setCurrentTeam = useCallback(
    (team: { id: string; name: string; calendarCount?: number }) => {
      setCurrentTeamState((prev) => ({
        id: team.id,
        name: team.name,
        slug: prev?.slug,
      }));
      if (typeof team.calendarCount === "number") {
        applyCalendarCount(team.calendarCount);
      }
    },
    [applyCalendarCount]
  );

  const setCalendarCount = useCallback(
    (count: number) => {
      applyCalendarCount(count);
    },
    [applyCalendarCount]
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors; still redirect to login
    }
    window.location.href = "/login";
  }, []);

  const needsCompanyOnboarding =
    authenticated && !(user?.companyName?.trim());

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      authenticated,
      user,
      currentTeam,
      calendarCount,
      teamVersion,
      needsCompanyOnboarding,
      refreshSession,
      setCurrentTeam,
      setCalendarCount,
      signOut,
    }),
    [
      loading,
      authenticated,
      user,
      currentTeam,
      calendarCount,
      teamVersion,
      needsCompanyOnboarding,
      refreshSession,
      setCurrentTeam,
      setCalendarCount,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
