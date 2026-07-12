const FORM_LABEL_CLASS = "text-sm font-medium text-gray-700 pt-2";
const WEEKDAY_SHORT = ["月", "火", "水", "木", "金", "土", "日"] as const;

/** /calendars/new・edit のデータ待ち。固定ラベル・ボタンは実表示 */
export function CalendarCreatePageSkeleton({
  title = "カレンダー作成",
  submitLabel = "作成する",
}: {
  title?: string;
  submitLabel?: string;
} = {}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <div className="overflow-hidden rounded-lg border border-border bg-white divide-y divide-border">
            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <span className={FORM_LABEL_CLASS}>
                カレンダー名<span className="text-red-500 ml-0.5">*</span>
              </span>
              <div className="space-y-2">
                <div className="h-10 w-full rounded-lg border border-border shimmer" />
                <div className="h-5 flex items-center gap-2.5">
                  <span className="h-4 w-4 rounded border border-gray-300 bg-white" />
                  <span className="text-sm leading-none text-gray-800">
                    非公開カレンダー名を設定する
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <span className={FORM_LABEL_CLASS}>
                所要時間<span className="text-red-500 ml-0.5">*</span>
              </span>
              <div className="h-10 w-full max-w-xs rounded-lg border border-border shimmer" />
            </div>

            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <span className={FORM_LABEL_CLASS}>参加メンバー設定</span>
              <div className="space-y-4">
                <div className="inline-flex rounded-lg border border-border p-0.5">
                  <span className="rounded-md px-4 py-2 text-sm font-medium bg-primary-light text-primary">
                    全員が参加
                  </span>
                  <span className="rounded-md px-4 py-2 text-sm font-medium text-gray-700">
                    誰か一人が参加
                  </span>
                </div>
                <div className="min-h-[48px] rounded-lg border border-border bg-muted/30 px-3 py-2 flex flex-wrap gap-2 content-start">
                  <div className="h-7 w-24 rounded-full shimmer" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500 shrink-0">候補メンバー：</span>
                  <div className="h-7 w-20 rounded-full shimmer" />
                  <div className="h-7 w-24 rounded-full shimmer" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <span className={FORM_LABEL_CLASS}>Web会議設定</span>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  日程調整完了時に Web 会議 URL の発行を自動で行います。
                </p>
                <div className="inline-flex rounded-lg border border-border p-0.5">
                  <span className="rounded-md px-4 py-2 text-sm font-medium bg-primary-light text-primary">
                    利用しない
                  </span>
                  <span className="rounded-md px-4 py-2 text-sm font-medium text-gray-700">
                    Zoom
                  </span>
                  <span className="rounded-md px-4 py-2 text-sm font-medium text-gray-700">
                    Google Meet
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[8.5rem_1fr] items-start gap-x-4 px-6 py-5">
              <span className={FORM_LABEL_CLASS}>日程候補設定</span>
              <div className="space-y-8">
                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">曜日ごとの受付時間</h3>
                  <div className="flex items-stretch overflow-hidden rounded-lg border border-border">
                    {WEEKDAY_SHORT.map((label, index) => (
                      <div
                        key={label}
                        className={`flex min-w-0 flex-1 flex-col items-stretch justify-start bg-white px-2 py-3 ${
                          index < WEEKDAY_SHORT.length - 1 ? "border-r border-border" : ""
                        }`}
                      >
                        <p className="text-center text-sm font-medium text-gray-900">{label}</p>
                        <div className="mt-2 mx-auto h-3 w-10 rounded shimmer" />
                        <div className="mt-1 mx-auto h-3 w-10 rounded shimmer" />
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">祝日の予約受付</h3>
                  <div className="h-10 w-full max-w-xs rounded-lg border border-border shimmer" />
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    何時間後から先の日程を提示しますか？
                  </h3>
                  <div className="h-10 w-full max-w-xs rounded-lg border border-border shimmer" />
                </section>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center pt-2">
          <span className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-gray-900">
            {submitLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
