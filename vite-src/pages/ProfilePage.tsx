import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AccountSettingsSection } from "@/components/account-settings-section";
import { ProfileNameForm } from "@/components/profile-name-form";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

type ProfileResponse = {
  name: string;
  email: string;
  companyName: string;
};

function PageLoading() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
      <div className="rounded-lg bg-white p-6 space-y-5">
        <div className="grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-5 items-start">
          <span className="text-sm font-medium text-gray-700 pt-2">メールアドレス</span>
          <div className="h-10 w-full max-w-md rounded-lg shimmer" />
          <span className="text-sm font-medium text-gray-700 pt-2">
            氏名 <span className="text-red-500">*</span>
          </span>
          <div className="h-10 w-full max-w-md rounded-lg shimmer" />
          <span className="text-sm font-medium text-gray-700 pt-2">
            会社名 <span className="text-red-500">*</span>
          </span>
          <div className="h-10 w-full max-w-md rounded-lg shimmer" />
        </div>
        <div className="flex justify-center pt-2">
          <span className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 opacity-50">
            変更を保存する
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { refreshSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await api<ProfileResponse>("/api/account/profile");
        if (!cancelled) setProfile(data);
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "プロフィールの取得に失敗しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !profile) {
    return <PageLoading />;
  }

  return (
    <AccountSettingsSection title="プロフィール">
      <ProfileNameForm
        initialName={profile.name}
        initialCompanyName={profile.companyName}
        email={profile.email}
        onSaved={() => {
          void refreshSession();
        }}
      />
    </AccountSettingsSection>
  );
}
