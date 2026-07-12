"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PresetMode } from "@/lib/schedule-candidate-settings";

type PresetSelectFieldProps = {
  id: string;
  options: ReadonlyArray<{ value: number; label: string }>;
  mode: PresetMode;
  presetValue: number;
  customValue: string;
  error?: string;
  customUnit: string;
  customPlaceholder: string;
  customMin: number;
  customMax: number;
  formatCustomSelected: (value: number) => string;
  onSelectPreset: (value: number) => void;
  onSelectCustom: () => void;
  onCustomChange: (value: string) => void;
};

export function PresetSelectField({
  id,
  options,
  mode,
  presetValue,
  customValue,
  error,
  customUnit,
  customPlaceholder,
  customMin,
  customMax,
  formatCustomSelected,
  onSelectPreset,
  onSelectCustom,
  onCustomChange,
}: PresetSelectFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(() => {
    if (mode === "custom") {
      const value = Number(customValue);
      if (Number.isFinite(value) && value >= customMin) {
        return formatCustomSelected(value);
      }
      return "カスタム...";
    }
    return options.find((option) => option.value === presetValue)?.label ?? "選択してください";
  }, [customMin, customValue, formatCustomSelected, mode, options, presetValue]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="space-y-2">
      <div ref={rootRef} className="relative w-[300px]">
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className={`flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-3 py-2 text-left text-sm text-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            error ? "border-red-500" : open ? "border-primary" : "border-border"
          }`}
        >
          <span>{selectedLabel}</span>
          <svg
            viewBox="0 0 12 8"
            className={`h-2.5 w-2.5 shrink-0 text-gray-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden
          >
            <path d="M1 1.5 6 6.5 11 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-white shadow-md"
          >
            {options.map((option) => {
              const selected = mode === "preset" && presetValue === option.value;
              return (
                <li key={option.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPreset(option.value);
                      setOpen(false);
                    }}
                    className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
            <li role="option" aria-selected={mode === "custom"}>
              <button
                type="button"
                onClick={() => {
                  onSelectCustom();
                  setOpen(false);
                }}
                className={`block w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors ${
                  mode === "custom"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-800 hover:bg-gray-50"
                }`}
              >
                カスタム...
              </button>
            </li>
          </ul>
        )}
      </div>

      {mode === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={customMin}
            max={customMax}
            value={customValue}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={customPlaceholder}
            className={`w-full max-w-[160px] rounded-lg border px-3 py-2 text-sm ${
              error ? "border-red-500" : "border-border"
            }`}
          />
          <span className="text-sm text-gray-600">{customUnit}</span>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
