"use client";

import { useState } from "react";
import { toast } from "sonner";

export function AporakuLinkForm({ initialAporakuUserId }: { initialAporakuUserId: string | null }) {
  const [aporakuUserId, setAporakuUserId] = useState(initialAporakuUserId ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/settings/aporaku", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aporakuUserId: aporakuUserId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");
      toast.success("保存しました");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium">アポラク ユーザー ID</span>
        <input
          type="text"
          value={aporakuUserId}
          onChange={(e) => setAporakuUserId(e.target.value)}
          placeholder="cuid..."
          className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono"
        />
        <p className="text-xs text-gray-500">
          配信リンク API（POST /api/links）で aporakuUserId からデフォルトカレンダーを解決する際に使用します。
        </p>
      </label>
      <button
        type="submit"
        disabled={loading || !aporakuUserId.trim()}
        className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
      >
        {loading ? "保存中..." : "変更を保存する"}
      </button>
    </form>
  );
}
