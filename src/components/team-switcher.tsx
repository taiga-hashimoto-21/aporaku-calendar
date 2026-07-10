"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type TeamItem = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "member";
};

type TeamSwitcherProps = {
  initialCurrentTeamId: string;
  initialCurrentTeamName: string;
};

export function TeamSwitcher({
  initialCurrentTeamId,
  initialCurrentTeamName,
}: TeamSwitcherProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [currentTeamId, setCurrentTeamId] = useState(initialCurrentTeamId);
  const [currentTeamName, setCurrentTeamName] = useState(initialCurrentTeamName);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "チームの取得に失敗しました");
      const nextTeams: TeamItem[] = data.teams ?? [];
      setTeams(nextTeams);
      const nextId = (data.currentTeamId as string | null) ?? initialCurrentTeamId;
      setCurrentTeamId(nextId);
      const matched = nextTeams.find((t) => t.id === nextId);
      if (matched) {
        setCurrentTeamName(matched.name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initialCurrentTeamId]);

  useEffect(() => {
    void loadTeams();
  }, [loadTeams]);

  // サーバー側の現在チーム（設定ページ保存後の refresh など）と同期
  useEffect(() => {
    setCurrentTeamId(initialCurrentTeamId);
    setCurrentTeamName(initialCurrentTeamName);
    setTeams((prev) =>
      prev.map((t) =>
        t.id === initialCurrentTeamId ? { ...t, name: initialCurrentTeamName } : t
      )
    );
  }, [initialCurrentTeamId, initialCurrentTeamName]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSwitch(teamId: string) {
    if (teamId === currentTeamId || switchingId) return;
    setSwitchingId(teamId);
    try {
      const res = await fetch("/api/teams/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "切り替えに失敗しました");
      setCurrentTeamId(data.id);
      setCurrentTeamName(data.name);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "切り替えに失敗しました");
    } finally {
      setSwitchingId(null);
    }
  }

  function openCreateModal() {
    setOpen(false);
    setModalOpen(true);
  }

  function handleCreated(team: TeamItem) {
    setTeams((prev) => {
      if (prev.some((t) => t.id === team.id)) return prev;
      return [...prev, team];
    });
    setCurrentTeamId(team.id);
    setCurrentTeamName(team.name);
    setModalOpen(false);
    toast.success("チームを作成しました");
    router.refresh();
  }

  const displayName = currentTeamName || "チーム";

  return (
    <>
      <div className="relative w-fit max-w-[600px]" ref={rootRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={loading && !currentTeamName}
          className={`inline-flex w-fit max-w-[600px] items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-gray-900 transition-colors hover:bg-muted disabled:opacity-60 ${
            open ? "bg-muted" : ""
          }`}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <span className="min-w-0 truncate font-medium">{displayName}</span>
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border bg-white py-2 shadow-lg"
          >
            <p className="px-4 pb-2 pt-1 text-xs text-gray-500">チームの切り替え</p>
            <div className="max-h-64 overflow-y-auto">
              {teams.map((team) => {
                const selected = team.id === currentTeamId;
                return (
                  <button
                    key={team.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={switchingId !== null}
                    onClick={() => void handleSwitch(team.id)}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      selected ? "font-medium text-gray-900" : "text-gray-800"
                    }`}
                  >
                    <span className="truncate">{team.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              onClick={openCreateModal}
              className="flex w-full items-center gap-1 px-4 py-2 text-left text-sm font-medium text-primary hover:bg-muted transition-colors"
            >
              <span aria-hidden>+</span>
              <span>チームを追加</span>
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <CreateTeamModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}

function CreateTeamModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (team: TeamItem) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const canSubmit = name.trim().length > 0 && !loading;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "作成に失敗しました");
      onCreated({
        id: data.id,
        name: data.name,
        slug: data.slug,
        role: "owner",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="booking-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-modal-title"
        className="booking-modal-panel w-full max-w-[440px] rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-8 pb-2 pt-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-muted hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          <div className="flex flex-col items-center text-center">
            <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </span>
            <h2
              id="create-team-modal-title"
              className="text-lg font-bold text-gray-900"
            >
              新しいチームを作成
            </h2>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-8 pb-8 pt-6"
          autoComplete="off"
        >
          <div className="grid grid-cols-[5.5rem_1fr] gap-x-4 items-start">
            <span className="text-sm font-medium text-gray-700 pt-2">
              チーム名 <span className="text-red-500">*</span>
            </span>
            <input
              id="create-team-name"
              name="team-display-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-1p-ignore
              data-lpignore="true"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {loading ? "作成中..." : "チームを作成する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
