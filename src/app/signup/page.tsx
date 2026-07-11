import Link from "next/link";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold hover:opacity-80">
            アポラク日程調整
          </Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            ログインはこちら
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">無料で新規登録</h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              Google アカウントで登録し、カレンダー連携を行います。
              登録後に氏名・会社名を確認して、すぐに日程調整を始められます。
            </p>
          </div>

          <GoogleAuthButton label="Google で新規登録" variant="primary" />

          <p className="text-xs text-gray-400 text-center">
            登録することで、利用規約およびプライバシーポリシーに同意したものとみなします。
          </p>
        </div>
      </div>
    </main>
  );
}
