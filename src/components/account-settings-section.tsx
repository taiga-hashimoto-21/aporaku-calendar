type AccountSettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function AccountSettingsSection({ title, children }: AccountSettingsSectionProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="rounded-lg bg-white p-6">{children}</div>
    </div>
  );
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
