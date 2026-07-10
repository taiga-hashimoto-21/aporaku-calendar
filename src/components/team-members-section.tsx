"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  TEAM_SETTINGS_GRID_CLASS,
  TEAM_SETTINGS_LABEL_CLASS,
} from "@/components/team-profile-form";

type Member = {
  id: string;
  userId: string;
  role: "owner" | "member";
  name: string | null;
  email: string;
  image: string | null;
};

type TeamMembersSectionProps = {
  members: Member[];
  isOwner: boolean;
};

export function TeamMembersSection({
  members,
  isOwner,
}: TeamMembersSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reissuing, setReissuing] = useState(false);

  async function fetchInviteLink(reissue = false) {
    if (reissue) setReissuing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/team/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reissue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "招待リンクの取得に失敗しました");
      setInviteUrl(data.url);
      if (reissue) toast.success("招待リンクを再発行しました");
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "招待リンクの取得に失敗しました");
      return false;
    } finally {
      setLoading(false);
      setReissuing(false);
    }
  }

  async function openInviteModal() {
    setModalOpen(true);
    if (!inviteUrl) {
      await fetchInviteLink(false);
    }
  }

  async function copyInviteUrl() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("URLをコピーしました");
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  return (
    <>
      <div className={TEAM_SETTINGS_GRID_CLASS}>
        <span className={TEAM_SETTINGS_LABEL_CLASS}>チームメンバー</span>
        <div className="min-w-0">
          {isOwner && (
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => void openInviteModal()}
                disabled={loading}
                className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              >
                メンバーを追加
              </button>
            </div>
          )}

          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {members.map((m) => {
              const displayName = m.name?.trim() || m.email;
              const initial = displayName.charAt(0).toUpperCase();
              return (
                <li key={m.id} className="flex items-center gap-3 px-4 py-3">
                  {m.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image}
                      alt=""
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {initial}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="truncate text-xs text-gray-500">{m.email}</p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {m.role === "owner" ? "オーナー" : "メンバー"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {modalOpen && (
        <InviteLinkModal
          inviteUrl={inviteUrl}
          loading={loading}
          reissuing={reissuing}
          onClose={() => setModalOpen(false)}
          onCopy={() => void copyInviteUrl()}
          onReissue={() => void fetchInviteLink(true)}
        />
      )}
    </>
  );
}

function InviteLinkModal({
  inviteUrl,
  loading,
  reissuing,
  onClose,
  onCopy,
  onReissue,
}: {
  inviteUrl: string | null;
  loading: boolean;
  reissuing: boolean;
  onClose: () => void;
  onCopy: () => void;
  onReissue: () => void;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="booking-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-link-modal-title"
        className="booking-modal-panel w-full max-w-[560px] rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative px-6 pb-2 pt-6 sm:px-8 sm:pt-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-muted hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          <h2
            id="invite-link-modal-title"
            className="pr-8 text-lg font-bold text-gray-900"
          >
            メンバー招待リンク
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            以下のURLから登録・ログインすると、このチームに参加できます。招待したいメンバーにURLを共有してください。
          </p>
        </div>

        <div className="px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
          <div className="flex overflow-hidden rounded-lg border border-border">
            <input
              type="text"
              readOnly
              value={loading && !inviteUrl ? "読み込み中..." : (inviteUrl ?? "")}
              className="min-w-0 flex-1 border-0 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none"
            />
            <button
              type="button"
              onClick={onCopy}
              disabled={!inviteUrl || loading}
              className="inline-flex shrink-0 items-center gap-1.5 border-l border-border bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              <CopyIcon />
              URLをコピー
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onReissue}
              disabled={reissuing || loading}
              className="text-xs text-gray-500 hover:text-gray-800 hover:underline disabled:opacity-50"
            >
              {reissuing ? "再発行中..." : "リンクを再発行"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-white px-5 py-2 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M7 3.5A1.5 1.5 0 018.5 2h6A1.5 1.5 0 0116 3.5v6a1.5 1.5 0 01-1.5 1.5h-.75a.75.75 0 000 1.5h.75A3 3 0 0017.5 9.5v-6A3 3 0 0014.5.5h-6A3 3 0 005.5 3.5v.75a.75.75 0 001.5 0V3.5z" />
      <path d="M3.5 7A1.5 1.5 0 015 5.5h6A1.5 1.5 0 0112.5 7v6a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 13V7z" />
    </svg>
  );
}
