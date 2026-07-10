"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ProfileNameFormProps = {
  initialName: string;
  email: string;
};

const LABEL_CLASS = "text-sm font-medium text-gray-700 pt-2";

export function ProfileNameForm({ initialName, email }: ProfileNameFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");
      setName(data.name ?? name);
      toast.success("保存しました");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-[8.5rem_1fr] gap-x-4 gap-y-5 items-start">
        <span className={LABEL_CLASS}>メールアドレス</span>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-gray-600"
        />

        <span className={LABEL_CLASS}>
          氏名 <span className="text-red-500">*</span>
        </span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-muted disabled:opacity-50 transition-colors"
        >
          {loading ? "保存中..." : "変更を保存する"}
        </button>
      </div>
    </form>
  );
}
