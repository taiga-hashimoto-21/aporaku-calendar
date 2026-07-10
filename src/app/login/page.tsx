import Link from "next/link";
import { GoogleAuthButton } from "@/components/google-auth-button";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold hover:opacity-80">
            日程調整ツール
          </Link>
          <Link href="/signup" className="text-sm text-gray-600 hover:text-gray-900">
            新規登録はこちら
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">ログイン</h1>
            <p className="text-sm text-gray-600">
              登録済みの Google アカウントでログインしてください。
            </p>
          </div>

          <GoogleAuthButton label="Google でログイン" />

          <p className="text-xs text-gray-400 text-center">
            アカウントをお持ちでない方は{" "}
            <Link href="/signup" className="text-primary hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
