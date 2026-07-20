/**
 * @component DateRangePicker
 * @prop startDate/endDate 선택된 날짜
 * @prop onChange (start, end) 콜백
 * @prop placeholder 미선택 시 텍스트
 */
"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  placeholder?: string;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = "날짜 범위 선택",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDay = new Date(viewMonth.year, viewMonth.month, 1).getDay();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const toDateStr = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isDisabled = (day: number) => {
    const d = new Date(viewMonth.year, viewMonth.month, day);
    return d < today;
  };

  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const d = toDateStr(viewMonth.year, viewMonth.month, day);
    return d >= startDate && d <= endDate;
  };

  const isSelected = (day: number) => {
    const d = toDateStr(viewMonth.year, viewMonth.month, day);
    return d === startDate || d === endDate;
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(day)) return;
    const d = toDateStr(viewMonth.year, viewMonth.month, day);

    if (selecting === "start") {
      onChange(d, null);
      setSelecting("end");
    } else {
      if (startDate && d < startDate) {
        onChange(d, null);
        setSelecting("end");
      } else {
        onChange(startDate, d);
        setSelecting("start");
        setOpen(false);
      }
    }
  };

  const prevMonth = () => {
    setViewMonth((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 }
    );
  };

  const nextMonth = () => {
    setViewMonth((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 }
    );
  };

  const displayText =
    startDate && endDate
      ? `${startDate.replace(/-/g, ".")} ~ ${endDate.replace(/-/g, ".")}`
      : startDate
        ? `${startDate.replace(/-/g, ".")} ~ ...`
        : placeholder;

  return (
    <div className="relative w-full">
      {/* 트리거 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full h-12 items-center justify-between rounded-xl border px-4 text-sm",
          startDate ? "text-neutral-900" : "text-neutral-400",
          "border-neutral-200 bg-white"
        )}
      >
        <span>{displayText}</span>
        <span className="text-neutral-300">▼</span>
      </button>

      {/* 달력 */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1 text-neutral-500">←</button>
            <span className="text-sm font-semibold">
              {viewMonth.year}. {viewMonth.month + 1}
            </span>
            <button type="button" onClick={nextMonth} className="p-1 text-neutral-500">→</button>
          </div>

          {/* 요일 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs text-neutral-400">{d}</div>
            ))}
          </div>

          {/* 날짜 */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const inRange = isInRange(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "h-8 w-full rounded-lg text-xs font-medium transition-colors",
                    disabled && "text-neutral-300 cursor-not-allowed",
                    !disabled && !selected && !inRange && "text-neutral-700 hover:bg-neutral-100",
                    inRange && !selected && "bg-blue-50 text-blue-600",
                    selected && "bg-black text-white"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
