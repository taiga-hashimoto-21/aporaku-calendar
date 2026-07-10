"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  addDaysToDateKey,
  formatTime,
  formatTimezoneLabel,
  getMonthGrid,
  parseDateKey,
  todayDateKey,
} from "@/lib/booking-timezone";

interface BookingForm {
  guestCompany: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
}

interface PublicCalendarPageProps {
  slug: string;
}

interface Slot {
  start: string;
  end: string;
}

interface CalendarInfo {
  name: string;
  description: string | null;
  durationMinutes: number;
  timezone: string;
  meetingType: string;
  bookingWindowDays: number;
  ownerName: string | null;
  ownerImage: string | null;
}

const WEEKDAY_SHORT = ["日", "月", "火", "水", "木", "金", "土"] as const;
const VISIBLE_DAYS = 7;

function monthGridRange(
  year: number,
  month: number,
  timezone: string
): { from: string; days: number } | null {
  const cells = getMonthGrid(year, month);
  const from = cells[0]?.dateKey;
  const to = cells[cells.length - 1]?.dateKey;
  if (!from || !to) return null;

  const fromDate = parseDateKey(from, timezone);
  const toDate = parseDateKey(to, timezone);
  const days =
    Math.round((toDate.getTime() - fromDate.getTime()) / 86400000) + 1;
  return { from, days };
}

function availableDatesFromSlots(slotsByDate: Record<string, Slot[]>): string[] {
  const available: string[] = [];
  for (const [dateKey, slots] of Object.entries(slotsByDate)) {
    if (slots.length > 0) available.push(dateKey);
  }
  return available;
}

export function PublicBookingPage({ slug }: PublicCalendarPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewConfirmed = searchParams.get("preview") === "confirmed";

  const [calendar, setCalendar] = useState<CalendarInfo | null>(null);
  const [slotsByDateCache, setSlotsByDateCache] = useState<Record<string, Slot[]>>({});
  const slotsByDateCacheRef = useRef<Record<string, Slot[]>>({});
  const [monthAvailability, setMonthAvailability] = useState<Set<string>>(new Set());
  const [monthAvailabilityKey, setMonthAvailabilityKey] = useState<string | null>(null);
  const monthAvailabilityCacheRef = useRef<Record<string, string[]>>({});
  const activeMonthKeyRef = useRef<string | null>(null);
  const pendingRangeFetchesRef = useRef<Set<string>>(new Set());
  const [viewStartDate, setViewStartDate] = useState<string>("");
  const [displayMonth, setDisplayMonth] = useState<{ year: number; month: number } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    slot: Slot;
    email: string;
  } | null>(null);
  const [previewDismissed, setPreviewDismissed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [step, setStep] = useState<"select" | "done">("select");
  const [form, setForm] = useState<BookingForm>({
    guestCompany: "",
    guestName: "",
    guestPhone: "",
    guestEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timezone = calendar?.timezone ?? "Asia/Tokyo";

  const mergeSlotsCache = useCallback((incoming: Record<string, Slot[]>) => {
    slotsByDateCacheRef.current = {
      ...slotsByDateCacheRef.current,
      ...incoming,
    };
    setSlotsByDateCache(slotsByDateCacheRef.current);
  }, []);

  const fetchSlots = useCallback(
    async (from: string, days: number) => {
      const res = await fetch(
        `/api/public/calendars/${slug}?from=${encodeURIComponent(from)}&days=${days}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "読み込みに失敗しました");
      return data as {
        calendar: CalendarInfo;
        slotsByDate: Record<string, Slot[]>;
        prefilledCompany?: string | null;
      };
    },
    [slug]
  );

  const applyMonthAvailability = useCallback(
    (monthKey: string, slotsByDate: Record<string, Slot[]>) => {
      const available = availableDatesFromSlots(slotsByDate);
      monthAvailabilityCacheRef.current[monthKey] = available;
      if (activeMonthKeyRef.current === monthKey) {
        setMonthAvailability(new Set(available));
        setMonthAvailabilityKey(monthKey);
      }
    },
    []
  );

  useEffect(() => {
    async function loadInitial() {
      setInitialLoading(true);
      setError(null);
      try {
        const today = todayDateKey("Asia/Tokyo");
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const monthKey = `${year}-${month}`;
        const range = monthGridRange(year, month, "Asia/Tokyo");
        if (!range) throw new Error("カレンダーの初期化に失敗しました");

        activeMonthKeyRef.current = monthKey;
        const data = await fetchSlots(range.from, range.days);

        mergeSlotsCache(data.slotsByDate);
        applyMonthAvailability(monthKey, data.slotsByDate);
        setCalendar(data.calendar);
        setViewStartDate(today);
        setDisplayMonth({ year, month });

        if (data.prefilledCompany) {
          setForm((prev) => ({
            ...prev,
            guestCompany: prev.guestCompany || data.prefilledCompany || "",
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "読み込みに失敗しました");
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitial();
  }, [fetchSlots, mergeSlotsCache, applyMonthAvailability]);

  useEffect(() => {
    if (!displayMonth || !calendar) return;

    const month = displayMonth;
    const monthKey = `${month.year}-${month.month}`;
    activeMonthKeyRef.current = monthKey;

    const cached = monthAvailabilityCacheRef.current[monthKey];
    if (cached) {
      setMonthAvailability(new Set(cached));
      setMonthAvailabilityKey(monthKey);
      return;
    }

    setMonthAvailability(new Set());
    setMonthAvailabilityKey(null);

    const range = monthGridRange(month.year, month.month, timezone);
    if (!range) return;

    const fetchKey = `month:${range.from}:${range.days}`;
    if (pendingRangeFetchesRef.current.has(fetchKey)) return;
    pendingRangeFetchesRef.current.add(fetchKey);

    let cancelled = false;

    async function loadMonthAvailability() {
      try {
        const data = await fetchSlots(range!.from, range!.days);
        if (cancelled || activeMonthKeyRef.current !== monthKey) return;

        mergeSlotsCache(data.slotsByDate);
        applyMonthAvailability(monthKey, data.slotsByDate);
        setCalendar(data.calendar);
      } catch {
        // 月表示のハイライト失敗は致命的ではない
      } finally {
        pendingRangeFetchesRef.current.delete(fetchKey);
      }
    }

    loadMonthAvailability();
    return () => {
      cancelled = true;
    };
  }, [
    displayMonth,
    calendar,
    fetchSlots,
    timezone,
    mergeSlotsCache,
    applyMonthAvailability,
  ]);

  const visibleDates = useMemo(() => {
    if (!viewStartDate) return [];
    return Array.from({ length: VISIBLE_DAYS }, (_, index) =>
      addDaysToDateKey(viewStartDate, index, timezone)
    );
  }, [viewStartDate, timezone]);

  // 表示中の7日に未キャッシュがあれば裏で取得（UIは差し替えない）
  useEffect(() => {
    if (!viewStartDate || initialLoading || !calendar) return;

    const missing = visibleDates.filter(
      (dateKey) => !(dateKey in slotsByDateCacheRef.current)
    );
    if (missing.length === 0) return;

    const fetchKey = `week:${viewStartDate}:${VISIBLE_DAYS}`;
    if (pendingRangeFetchesRef.current.has(fetchKey)) return;
    pendingRangeFetchesRef.current.add(fetchKey);

    let cancelled = false;

    async function fillMissingWeek() {
      try {
        const data = await fetchSlots(viewStartDate, VISIBLE_DAYS);
        if (cancelled) return;
        mergeSlotsCache(data.slotsByDate);
        setCalendar(data.calendar);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "読み込みに失敗しました");
        }
      } finally {
        pendingRangeFetchesRef.current.delete(fetchKey);
      }
    }

    fillMissingWeek();
    return () => {
      cancelled = true;
    };
  }, [
    viewStartDate,
    visibleDates,
    initialLoading,
    calendar,
    fetchSlots,
    mergeSlotsCache,
  ]);

  const weekSlotsByDate = useMemo(() => {
    const result: Record<string, Slot[]> = {};
    for (const dateKey of visibleDates) {
      result[dateKey] = slotsByDateCache[dateKey] ?? [];
    }
    return result;
  }, [visibleDates, slotsByDateCache]);

  const maxSlotCount = useMemo(() => {
    return Math.max(
      1,
      ...visibleDates.map((dateKey) => weekSlotsByDate[dateKey]?.length ?? 0)
    );
  }, [visibleDates, weekSlotsByDate]);

  const bookingWindowEnd = useMemo(() => {
    if (!calendar) return todayDateKey(timezone);
    return addDaysToDateKey(todayDateKey(timezone), calendar.bookingWindowDays, timezone);
  }, [calendar, timezone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;

    const guestName = form.guestName.trim();
    const guestPhone = form.guestPhone.trim();
    if (!guestName) {
      setError("氏名を入力してください");
      return;
    }
    if (!guestPhone) {
      setError("電話番号を入力してください");
      return;
    }
    if (!/^[\d-]+$/.test(guestPhone) || !/\d/.test(guestPhone)) {
      setError("電話番号は数字で入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    const answers = [{ label: "電話番号", value: guestPhone }];

    try {
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          startAt: selectedSlot.start,
          guestName,
          guestEmail: form.guestEmail,
          guestCompany: form.guestCompany.trim() || undefined,
          answers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "予約に失敗しました");
      setConfirmedBooking({
        slot: selectedSlot,
        email: form.guestEmail.trim(),
      });
      setSelectedSlot(null);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "予約に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  const closeBookingModal = useCallback(() => {
    setSelectedSlot(null);
    setError(null);
  }, []);

  const closeConfirmedModal = useCallback(() => {
    setPreviewDismissed(true);
    setConfirmedBooking(null);
    setStep("select");
    setError(null);
    if (previewConfirmed) {
      router.replace(pathname);
    }
  }, [previewConfirmed, router, pathname]);

  useEffect(() => {
    if (!previewConfirmed) {
      setPreviewDismissed(false);
      return;
    }
    if (!calendar || previewDismissed || confirmedBooking) return;

    const start = new Date();
    start.setSeconds(0, 0);
    start.setMinutes(0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + calendar.durationMinutes * 60_000);

    setConfirmedBooking({
      slot: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      email: "preview@example.com",
    });
    setStep("done");
  }, [previewConfirmed, calendar, previewDismissed, confirmedBooking]);

  function isDateSelectable(dateKey: string): boolean {
    const today = todayDateKey(timezone);
    return dateKey >= today && dateKey <= bookingWindowEnd;
  }

  function handleSelectDate(dateKey: string) {
    setViewStartDate(dateKey);
  }

  function shiftWeek(delta: number) {
    if (!viewStartDate) return;
    const next = addDaysToDateKey(viewStartDate, delta * VISIBLE_DAYS, timezone);
    const today = todayDateKey(timezone);
    if (next < today && delta < 0) {
      setViewStartDate(today);
      return;
    }
    if (next > bookingWindowEnd && delta > 0) return;
    setViewStartDate(next);
  }

  function shiftMonth(delta: number) {
    if (!displayMonth) return;
    const date = new Date(displayMonth.year, displayMonth.month - 1 + delta, 1);
    setDisplayMonth({ year: date.getFullYear(), month: date.getMonth() + 1 });
  }

  if (initialLoading) {
    return <p className="py-16 text-center text-sm text-gray-500">読み込み中...</p>;
  }

  if (error && !calendar) {
    return <p className="py-16 text-center text-sm text-red-600">{error}</p>;
  }

  const creatorLabel = calendar?.ownerName ?? "担当者";

  return (
    <div className="w-full">
      <header className="grid grid-cols-1 gap-y-4 pb-8 sm:grid-cols-[auto_1fr] sm:gap-x-24 sm:gap-y-4 lg:gap-x-32 xl:gap-x-40">
        <div className="flex shrink-0 items-center gap-3 sm:self-center">
          {calendar?.ownerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={calendar.ownerImage}
              alt={creatorLabel}
              referrerPolicy="no-referrer"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-medium text-primary">
              {creatorLabel.slice(0, 1)}
            </span>
          )}
          <span className="text-[1.5rem] font-normal leading-tight text-[#1f1f1f]">{creatorLabel}</span>
        </div>

        {calendar?.name && (
          <h1 className="min-w-0 text-[1.5rem] font-normal leading-tight text-gray-900 sm:col-start-2 sm:row-start-1 sm:self-center">
            {calendar.name}
          </h1>
        )}

        <div className="sm:col-start-2 sm:row-start-2">
          <p className="flex items-center gap-2 text-sm text-[#1f1f1f]">
            <ClockIcon />
            <span>{calendar?.durationMinutes} 分の予約</span>
          </p>
          {calendar?.description && (
            <p className="mt-2 text-sm text-gray-600">{calendar.description}</p>
          )}
        </div>
      </header>

      {(step === "select" || step === "done") && (
        <section className="overflow-visible rounded-lg border border-[var(--gm3-sys-color-outline-variant)] px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 className="text-base font-normal text-[#1f1f1f]">予約時間を選択</h2>
            <p className="shrink-0 text-sm text-[#1f1f1f]">{formatTimezoneLabel(timezone)}</p>
          </div>

          <div className="flex w-full flex-col gap-9 overflow-visible xl:flex-row xl:gap-16">
            {displayMonth && (
              <MiniCalendar
                displayMonth={displayMonth}
                selectedDate={viewStartDate}
                availability={monthAvailability}
                monthLoaded={
                  monthAvailabilityKey === `${displayMonth.year}-${displayMonth.month}`
                }
                bookingWindowEnd={bookingWindowEnd}
                onSelectDate={handleSelectDate}
                onPrevMonth={() => shiftMonth(-1)}
                onNextMonth={() => shiftMonth(1)}
                isDateSelectable={isDateSelectable}
              />
            )}

            <div className="min-w-0 flex-1 overflow-visible">
              <WeekSlotGrid
                dates={visibleDates}
                slotsByDate={weekSlotsByDate}
                timezone={timezone}
                maxRows={maxSlotCount}
                canGoPrev={viewStartDate > todayDateKey(timezone)}
                canGoNext={
                  addDaysToDateKey(viewStartDate, VISIBLE_DAYS - 1, timezone) <
                  bookingWindowEnd
                }
                onPrevWeek={() => shiftWeek(-1)}
                onNextWeek={() => shiftWeek(1)}
                onSelectSlot={(slot) => {
                  setSelectedSlot(slot);
                  setError(null);
                }}
              />

              {error && !selectedSlot && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {selectedSlot && calendar && step === "select" && (
        <BookingModal
          calendar={calendar}
          slot={selectedSlot}
          timezone={timezone}
          creatorLabel={creatorLabel}
          form={form}
          error={error}
          submitting={submitting}
          onChangeForm={setForm}
          onClose={closeBookingModal}
          onSubmit={handleSubmit}
        />
      )}

      {step === "done" && confirmedBooking && calendar && (
        <BookingConfirmedModal
          calendar={calendar}
          slot={confirmedBooking.slot}
          email={confirmedBooking.email}
          timezone={timezone}
          creatorLabel={creatorLabel}
          onClose={closeConfirmedModal}
        />
      )}
    </div>
  );
}

function formatBookingSlotLabel(start: string, end: string, timezone: string): string {
  const startDate = new Date(start);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    timeZone: timezone,
  }).format(startDate);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: timezone,
  }).format(startDate);
  const weekday = new Intl.DateTimeFormat("ja-JP", {
    weekday: "long",
    timeZone: timezone,
  }).format(startDate);

  return `${month}月 ${day}日 (${weekday}) · ${formatTime(start, timezone)}～${formatTime(end, timezone)}`;
}

function BookingModal({
  calendar,
  slot,
  timezone,
  creatorLabel,
  form,
  error,
  submitting,
  onChangeForm,
  onClose,
  onSubmit,
}: {
  calendar: CalendarInfo;
  slot: Slot;
  timezone: string;
  creatorLabel: string;
  form: BookingForm;
  error: string | null;
  submitting: boolean;
  onChangeForm: (form: BookingForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const showGoogleMeet = calendar.meetingType === "google_meet";

  return (
    <div
      className="booking-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="booking-modal-panel w-full max-w-[460px] rounded-[28px] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="px-8 py-8">
          <div className="space-y-2">
            <h2
              id="booking-modal-title"
              className="text-[1.375rem] font-normal leading-snug text-[#1f1f1f]"
            >
              {creatorLabel} と {calendar.durationMinutes} 分間の予定
            </h2>
            <p className="text-sm text-[#1f1f1f]">
              {formatBookingSlotLabel(slot.start, slot.end, timezone)}
            </p>
            <p className="text-sm text-[#444746]">{formatTimezoneLabel(timezone)}</p>
          </div>

          {showGoogleMeet && (
            <div className="mt-6 flex items-start gap-3">
              <GoogleMeetIcon />
              <p className="text-sm leading-6 text-[#1f1f1f]">
                予約後に Google Meet ビデオ会議の情報が追加されます
              </p>
            </div>
          )}

          <div className="my-6 h-px bg-[#c4c7c5]" />

          <div className="mb-5 flex items-center gap-2">
            <ContactCardIcon />
            <span className="text-sm text-[#444746]">ご連絡先情報</span>
          </div>

          <div className="space-y-4">
            <BookingField
              label="会社名"
              value={form.guestCompany}
              onChange={(guestCompany) => onChangeForm({ ...form, guestCompany })}
              autoComplete="organization"
            />
            <BookingField
              label="氏名"
              value={form.guestName}
              onChange={(guestName) => onChangeForm({ ...form, guestName })}
              autoComplete="name"
              required
            />
            <BookingField
              label="電話番号"
              type="tel"
              inputMode="numeric"
              pattern="[0-9-]*"
              value={form.guestPhone}
              onChange={(guestPhone) =>
                onChangeForm({
                  ...form,
                  guestPhone: guestPhone
                    .replace(/[０-９]/g, (char) =>
                      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
                    )
                    .replace(/[－ー−‐]/g, "-")
                    .replace(/[^\d-]/g, ""),
                })
              }
              autoComplete="tel"
              required
            />
            <BookingField
              label="メールアドレス"
              type="email"
              value={form.guestEmail}
              onChange={(guestEmail) => onChangeForm({ ...form, guestEmail })}
              autoComplete="email"
              required
            />
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-2 py-2 text-sm font-medium text-primary hover:bg-[#ECF1FC] rounded-full transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={submitting}
              aria-label={submitting ? "予約処理中" : "予約"}
              className="inline-flex h-10 min-w-[88px] cursor-pointer items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <BookingSpinner /> : "予約"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookingConfirmedModal({
  calendar,
  slot,
  email,
  timezone,
  creatorLabel,
  onClose,
}: {
  calendar: CalendarInfo;
  slot: Slot;
  email: string;
  timezone: string;
  creatorLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const startDate = new Date(slot.start);
  const month = new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    timeZone: timezone,
  }).format(startDate);
  const day = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: timezone,
  }).format(startDate);
  const weekday = new Intl.DateTimeFormat("ja-JP", {
    weekday: "long",
    timeZone: timezone,
  }).format(startDate);

  return (
    <div
      className="booking-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-confirmed-title"
        className="booking-modal-panel w-full max-w-[460px] rounded-[28px] bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="mx-auto mb-5 flex h-[66px] w-[66px] items-center justify-center rounded-full border border-[#dadce0]">
            <ConfirmedCheckIcon />
          </div>
          <h2
            id="booking-confirmed-title"
            className="text-[1.375rem] font-normal leading-snug text-[#1f1f1f]"
          >
            予約が確定しました
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#444746]">
            確認メールを以下のメールアドレス宛に送信しました。
          </p>
          <p className="mt-1 text-sm font-medium text-[#1f1f1f]">{email}</p>
        </div>

        <div className="mx-8 h-px bg-[#e0e0e0]" />

        <div className="flex items-start gap-5 px-8 py-6">
          <div className="w-12 shrink-0 text-center">
            <p className="text-[1.75rem] font-normal leading-none text-[#1f1f1f]">{day}</p>
            <p className="mt-1 text-xs text-[#444746]">{month}月</p>
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-medium leading-5 text-[#1f1f1f]">
              {creatorLabel} と {calendar.durationMinutes} 分間の予定
            </p>
            <p className="mt-1 text-sm leading-5 text-[#444746]">
              {weekday} ・ {formatTime(slot.start, timezone)}～
              {formatTime(slot.end, timezone)}
            </p>
            <p className="mt-1 text-sm leading-5 text-[#444746]">
              {formatTimezoneLabel(timezone)}
            </p>
          </div>
        </div>

        <div className="mx-8 h-px bg-[#e0e0e0]" />

        <div className="px-8 py-5">
          <p className="text-center text-sm leading-6 text-[#444746]">
            変更が必要な場合は、
            <br />
            <button
              type="button"
              className="cursor-pointer text-primary hover:underline"
              onClick={() => {
                // Phase 2: キャンセルフロー
              }}
            >
              予約をキャンセルしてください
            </button>
          </p>
        </div>

        <div className="flex justify-end px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-primary hover:bg-[#ECF1FC] transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingField({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  pattern,
  autoComplete,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "numeric" | "tel" | "text" | "email";
  pattern?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[#444746]">
        {label}
        {required && (
          <span className="text-red-600" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        inputMode={inputMode}
        pattern={pattern}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[#747775] bg-white px-3 py-2.5 text-sm text-[#1f1f1f] shadow-none outline-none ring-0 transition-[border-color,box-shadow] focus:border-[#0b57d0] focus:shadow-[inset_0_0_0_2px_#0b57d0] focus:outline-none focus:ring-0"
      />
    </label>
  );
}

function GoogleMeetIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden>
      <path
        fill="#00832D"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
      />
      <rect x="7" y="7" width="10" height="10" rx="2" fill="#fff" />
      <path fill="#00832D" d="M9.5 10.5 11 13l1.5-2.5H14v5h-1.2v-3.1L11 13.8 9.2 12.4V15.5H8v-5h1.5z" />
    </svg>
  );
}

function ContactCardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#444746]" fill="none" aria-hidden>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MiniCalendar({
  displayMonth,
  selectedDate,
  availability,
  monthLoaded,
  bookingWindowEnd,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  isDateSelectable,
}: {
  displayMonth: { year: number; month: number };
  selectedDate: string;
  availability: Set<string>;
  monthLoaded: boolean;
  bookingWindowEnd: string;
  onSelectDate: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isDateSelectable: (dateKey: string) => boolean;
}) {
  const monthLabel = `${displayMonth.year}年 ${displayMonth.month}月`;

  const cells = getMonthGrid(displayMonth.year, displayMonth.month);
  // 翌月1日が受付期間内なら進める（月末が期間外でも月初が有効なら表示する）
  const nextMonthDate = new Date(displayMonth.year, displayMonth.month, 1);
  const nextMonthStart = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}-01`;
  const canGoNext = nextMonthStart <= bookingWindowEnd;

  return (
    <div className="w-[230px] shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium leading-6 text-gray-900">{monthLabel}</p>
        <div className="flex items-center">
          <button
            type="button"
            aria-label="前の月"
            onClick={onPrevMonth}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="次の月"
            onClick={onNextMonth}
            disabled={!canGoNext}
            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid w-[230px] grid-cols-7 gap-2 text-center">
        {WEEKDAY_SHORT.map((label) => (
          <div
            key={label}
            className="flex h-6 items-center justify-center text-[11px] font-normal leading-6 text-[#444746]"
          >
            {label}
          </div>
        ))}

        {cells.map((cell) => {
          const inWindow = isDateSelectable(cell.dateKey);
          const hasSlots = availability.has(cell.dateKey);
          const isSelected = cell.dateKey === selectedDate;
          const isUnavailable =
            !inWindow || (monthLoaded && inWindow && !hasSlots);
          const isBookable = inWindow && hasSlots;

          return (
            <div key={cell.dateKey} className="flex h-6 items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectDate(cell.dateKey)}
                className={`relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-[10px] font-normal leading-none ${
                  isSelected
                    ? "bg-[var(--gm3-sys-color-primary)] text-white"
                    : isBookable
                      ? "bg-[var(--gm3-sys-color-primary-container)] text-[#1f1f1f] hover:bg-[#B1D8EF]"
                      : isUnavailable
                        ? "text-[#1f1f1f] hover:bg-[#ECEDEF]"
                        : "text-[#1f1f1f] hover:bg-gray-100"
                }`}
              >
                <span className={isUnavailable ? "line-through decoration-gray-500" : ""}>
                  {cell.day}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekSlotGrid({
  dates,
  slotsByDate,
  timezone,
  maxRows,
  canGoPrev,
  canGoNext,
  onPrevWeek,
  onNextWeek,
  onSelectSlot,
}: {
  dates: string[];
  slotsByDate: Record<string, Slot[]>;
  timezone: string;
  maxRows: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectSlot: (slot: Slot) => void;
}) {
  return (
    <div className="relative w-full overflow-visible">
      <div className="relative mb-3">
        <div className="grid w-full grid-cols-7 gap-2 sm:gap-3">
          {dates.map((dateKey) => {
            const weekday = new Intl.DateTimeFormat("ja-JP", {
              weekday: "short",
              timeZone: timezone,
            }).format(parseDateKey(dateKey, timezone));
            const dayNumber = new Intl.DateTimeFormat("ja-JP", {
              day: "numeric",
              timeZone: timezone,
            }).format(parseDateKey(dateKey, timezone));

            return (
              <div key={`${dateKey}-header`} className="min-w-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-gray-600">{weekday}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-normal text-gray-900">
                    {dayNumber}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="前の週"
          onClick={onPrevWeek}
          disabled={!canGoPrev}
          className="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label="次の週"
          onClick={onNextWeek}
          disabled={!canGoNext}
          className="absolute top-1/2 right-0 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid w-full grid-cols-7 gap-2 sm:gap-3">
        {dates.map((dateKey) => {
          const slots = slotsByDate[dateKey] ?? [];

          return (
            <div key={dateKey} className="min-w-0">
              <div className="space-y-2">
                {Array.from({ length: maxRows }, (_, rowIndex) => {
                  const slot = slots[rowIndex];
                  if (!slot) {
                    return (
                      <div
                        key={`${dateKey}-empty-${rowIndex}`}
                        className="flex h-10 items-center justify-center text-gray-300"
                        aria-hidden
                      >
                        —
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => onSelectSlot(slot)}
                      className="flex h-10 w-full cursor-pointer items-center justify-center rounded-full border border-[#747775] bg-white text-sm font-medium text-primary transition-colors hover:bg-[#ECF1FC]"
                    >
                      {formatTime(slot.start, timezone)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-current" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M8 5v3l2 1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ConfirmedCheckIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/check.webp"
      alt=""
      width={35}
      height={35}
      className="h-[35px] w-[35px] object-contain"
      aria-hidden
    />
  );
}

function BookingSpinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 animate-spin text-white"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 3a9 9 0 1 1-9 9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="M15 6 9 12l6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
