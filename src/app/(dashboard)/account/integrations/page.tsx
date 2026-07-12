import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { ZoomConnectControls } from "@/components/zoom-connect-controls";

export default async function AccountIntegrationsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const zoom = await prisma.zoomConnection.findUnique({
    where: { userId: session.user.id },
  });

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
          <ZoomConnectControls connected={Boolean(zoom)} />
        </section>
      </div>
    </AccountSettingsSection>
  );
}
