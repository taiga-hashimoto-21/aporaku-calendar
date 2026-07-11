import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AccountSettingsSection,
  StatusBadge,
} from "@/components/account-settings-section";
import { AporakuLinkForm } from "@/components/aporaku-link-form";
import { ZoomConnectControls } from "@/components/zoom-connect-controls";
import { api } from "../lib/api";

type IntegrationsResponse = {
  googleConnected: boolean;
  googleEmail: string | null;
  googleCalendarId: string;
  zoomConnected: boolean;
  aporakuUserId: string | null;
};

function PageLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded shimmer" />
      <div className="rounded-lg bg-white p-6 space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded shimmer" />
          <div className="h-4 w-full max-w-lg rounded shimmer" />
          <div className="h-5 w-20 rounded-full shimmer" />
        </div>
        <div className="space-y-3 pt-6 border-t border-border">
          <div className="h-4 w-24 rounded shimmer" />
          <div className="h-10 w-full max-w-md rounded shimmer" />
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
          <h3 className="text-sm font-medium text-gray-900">Google</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            カレンダー連携は Google アカウントでのログイン時に行われます。
          </p>
          <StatusBadge connected={integrations.googleConnected} />
        </section>

        <section className="space-y-3 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-gray-900">アポラク</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            配信リンク発行 API で使用するアポラクユーザー ID を設定します。
          </p>
          <AporakuLinkForm initialAporakuUserId={integrations.aporakuUserId} />
        </section>

        <section className="space-y-3 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-gray-900">Zoom</h3>
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
