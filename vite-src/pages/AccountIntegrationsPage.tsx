import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { ZoomConnectControls } from "@/components/zoom-connect-controls";
import { api } from "../lib/api";

type IntegrationsResponse = {
  zoomConnected: boolean;
};

function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded shimmer" />
      <div className="rounded-lg bg-white p-6 space-y-6">
        <div className="space-y-3">
          <img
            src="/images/zoom-logo.png"
            alt="Zoom"
            className="h-7 w-auto"
          />
          <p className="text-sm text-gray-600 leading-relaxed">
            カレンダー設定で Zoom を選択した場合に、予約確定時にミーティング URL を自動発行します。
          </p>
          <div className="h-5 w-20 rounded-full shimmer" />
        </div>
      </div>
    </div>
  );
}

export function AccountIntegrationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<IntegrationsResponse | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api<IntegrationsResponse>("/api/account/integrations");
      setIntegrations(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "連携情報の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const zoom = searchParams.get("zoom");
    if (!zoom) return;

    if (zoom === "connected") {
      toast.success("Zoom 連携が完了しました");
      void load();
    } else if (zoom === "error") {
      const message =
        searchParams.get("message") || "Zoom 連携に失敗しました";
      toast.error(message);
    }

    const next = new URLSearchParams(searchParams);
    next.delete("zoom");
    next.delete("message");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  if (loading || !integrations) {
    return <PageLoading />;
  }

  return (
    <AccountSettingsSection title="サービス連携">
      <div className="space-y-8">
        <section className="space-y-3">
          <img
            src="/images/zoom-logo.png"
            alt="Zoom"
            className="h-7 w-auto"
          />
          <p className="text-sm text-gray-600 leading-relaxed">
            カレンダー設定で Zoom を選択した場合に、予約確定時にミーティング URL を自動発行します。
          </p>
          <ZoomConnectControls
            connected={integrations.zoomConnected}
            onDisconnected={() => {
              setIntegrations((prev) =>
                prev ? { ...prev, zoomConnected: false } : prev
              );
            }}
          />
        </section>
      </div>
    </AccountSettingsSection>
  );
}
