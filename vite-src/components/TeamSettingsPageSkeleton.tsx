import {
  TEAM_SETTINGS_GRID_CLASS,
  TEAM_SETTINGS_LABEL_CLASS,
} from "@/components/team-profile-form";

function MemberRowSkeleton() {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="h-9 w-9 shrink-0 rounded-full shimmer" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-4 w-28 max-w-full rounded shimmer" />
        <div className="h-3 w-40 max-w-full rounded shimmer" />
      </div>
      <div className="h-3 w-14 shrink-0 rounded shimmer" />
    </li>
  );
}

/** /dashboard/team のデータ待ち。固定ラベル・ボタン文言は実表示 */
export function TeamSettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">チーム設定</h1>
      <div className="space-y-4">
        <div className="rounded-lg bg-white p-6">
          <div className={TEAM_SETTINGS_GRID_CLASS}>
            <span className={TEAM_SETTINGS_LABEL_CLASS}>
              チーム名 <span className="text-red-500">*</span>
            </span>
            <div className="h-10 w-full rounded-lg border border-border shimmer" />
          </div>
          <div className="mt-6 flex justify-center">
            <span className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900">
              変更を保存する
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6">
          <div className={TEAM_SETTINGS_GRID_CLASS}>
            <span className={TEAM_SETTINGS_LABEL_CLASS}>チームメンバー</span>
            <div className="min-w-0">
              <div className="mb-3 flex justify-end">
                <span className="text-sm font-medium text-primary">メンバーを追加</span>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                <MemberRowSkeleton />
                <MemberRowSkeleton />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
