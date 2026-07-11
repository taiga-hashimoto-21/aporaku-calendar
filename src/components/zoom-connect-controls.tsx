"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/account-settings-section";

type ZoomConnectControlsProps = {
  connected: boolean;
  onDisconnected?: () => void;
};

export function ZoomConnectControls({
  connected,
  onDisconnected,
}: ZoomConnectControlsProps) {
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    if (disconnecting) return;
    if (!window.confirm("Zoom 連携を解除しますか？")) return;

    setDisconnecting(true);
    try {
      const res = await fetch("/api/integrations/zoom/disconnect", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "連携解除に失敗しました");
      toast.success("Zoom 連携を解除しました");
      onDisconnected?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "連携解除に失敗しました");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <StatusBadge
        connected={connected}
        label={connected ? "連携済み" : "未連携"}
      />
      {connected ? (
        <button
          type="button"
          onClick={() => void handleDisconnect()}
          disabled={disconnecting}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {disconnecting ? "解除中..." : "連携を解除"}
        </button>
      ) : (
        <a
          href="/api/integrations/zoom/authorize"
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
        >
          Zoom と連携する
        </a>
      )}
    </div>
  );
}
