import { auth } from "@/lib/auth";
import {
  acceptTeamInvite,
  findTeamInvite,
} from "@/lib/team";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GoogleAuthButton } from "@/components/google-auth-button";

type PageProps = {
  params: Promise<{ invitePublicId: string; token: string }>;
};

export default async function TeamInvitePage({ params }: PageProps) {
  const { invitePublicId, token } = await params;
  const invite = await findTeamInvite(invitePublicId, token);

  if (!invite) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-xl font-bold text-gray-900">招待リンクが無効です</h1>
          <p className="text-sm text-gray-600">
            リンクが間違っているか、再発行されて無効になった可能性があります。
          </p>
          <Link href="/login" className="inline-block text-sm text-primary hover:underline">
            ログインへ
          </Link>
        </div>
      </main>
    );
  }

  const session = await auth();
  const callbackPath = `/team/${invitePublicId}/invite/${token}`;

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-4">
            <Link href="/" className="text-sm font-semibold hover:opacity-80">
              日程調整アプリ
            </Link>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold text-gray-900">
                チーム「{invite.name}」に招待されました
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                ログインまたは会員登録をすると「{invite.name}」に参加できます。
              </p>
            </div>
            <GoogleAuthButton
              label="Google でログインして参加"
              redirectTo={callbackPath}
            />
            <p className="text-xs text-gray-400 text-center">
              アカウントをお持ちでない方も、上のボタンから登録できます。
            </p>
          </div>
        </div>
      </main>
    );
  }

  try {
    await acceptTeamInvite(session.user.id, invitePublicId, token);
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_INVITE") {
      redirect("/dashboard");
    }
    throw error;
  }

  redirect("/dashboard");
}
