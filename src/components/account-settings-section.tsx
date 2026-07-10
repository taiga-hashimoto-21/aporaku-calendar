type AccountSettingsSectionProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** true のとき白い1枚カードで包まない（複数カードを並べる用） */
  unboxed?: boolean;
};

export function AccountSettingsSection({
  title,
  action,
  children,
  unboxed = false,
}: AccountSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {action}
      </div>
      {unboxed ? children : <div className="rounded-lg bg-white p-6">{children}</div>}
    </div>
  );
}

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-white p-6">{children}</div>;
}

export function StatusBadge({ connected, label }: { connected: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
        connected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
      }`}
    >
      {label ?? (connected ? "連携済み" : "未連携")}
    </span>
  );
}
