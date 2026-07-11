"use client";

import { useState } from "react";
import { toast } from "sonner";

type TeamProfileFormProps = {
  teamId: string;
  initialName: string;
  onSaved?: (name: string) => void;
};

export const TEAM_SETTINGS_LABEL_CLASS = "text-sm font-medium text-gray-700 pt-2";
export const TEAM_SETTINGS_GRID_CLASS =
  "grid grid-cols-[8.5rem_1fr] gap-x-4 items-start";

export function TeamProfileForm({ teamId, initialName, onSaved }: TeamProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");

      const nextName = data.name ?? name.trim();
      setName(nextName);
      toast.success("保存しました");
      onSaved?.(nextName);
      window.dispatchEvent(
        new CustomEvent("team-changed", { detail: { id: teamId, name: nextName } })
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" value={teamId} readOnly />

      <div className={TEAM_SETTINGS_GRID_CLASS}>
        <span className={TEAM_SETTINGS_LABEL_CLASS}>
          チーム名 <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {loading ? "保存中..." : "変更を保存する"}
        </button>
      </div>
    </form>
  );
}
