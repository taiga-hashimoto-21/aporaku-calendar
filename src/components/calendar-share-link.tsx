"use client";

import { useState } from "react";
import { toast } from "sonner";

type CalendarShareLinkProps = {
  url: string;
  label?: string;
  description?: string;
  variant?: "default" | "compact";
};

export function CalendarShareLink({
  url,
  label = "予約リンク",
  description = "このリンクを共有すると、相手が日程を予約できます。",
  variant = "default",
}: CalendarShareLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("リンクをコピーしました");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("コピーに失敗しました");
    }
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 truncate text-xs text-primary hover:underline"
        >
          {url}
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          readOnly
          value={url}
          aria-label={label}
          className="min-w-0 flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-gray-800"
          onFocus={(event) => event.target.select()}
        />
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
          >
            {copied ? "コピー済み" : "コピー"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-muted transition-colors"
          >
            開く
          </a>
        </div>
      </div>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  );
}
