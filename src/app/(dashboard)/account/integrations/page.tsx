import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AporakuLinkForm } from "@/components/aporaku-link-form";
import {
  AccountSettingsSection,
  StatusBadge,
} from "@/components/account-settings-section";
import { ZoomConnectControls } from "@/components/zoom-connect-controls";

export default async function AccountIntegrationsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [googleAccount, zoom, user] = await Promise.all([
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "google" },
      select: { id: true },
    }),
    prisma.zoomConnection.findUnique({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aporakuUserId: true },
    }),
  ]);

  return (
    <AccountSettingsSection title="サービス連携">
      <div className="space-y-8">
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Google</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            カレンダー連携は Google アカウントでのログイン時に行われます。
          </p>
          <StatusBadge connected={Boolean(googleAccount)} />
        </section>

        <section className="space-y-3 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-gray-900">アポラク</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            配信リンク発行 API で使用するアポラクユーザー ID を設定します。
          </p>
          <AporakuLinkForm initialAporakuUserId={user?.aporakuUserId ?? null} />
        </section>

        <section className="space-y-3 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-gray-900">Zoom</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            カレンダー設定で Zoom を選択した場合に、予約確定時にミーティング URL を自動発行します。
          </p>
          <ZoomConnectControls connected={Boolean(zoom)} />
        </section>
      </div>
    </AccountSettingsSection>
  );
}
