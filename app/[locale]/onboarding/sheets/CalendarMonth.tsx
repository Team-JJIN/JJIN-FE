"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

type CalendarMonthProps = {
  year: number;
  month: number;
  today: Date;
  tempDateStart: string | null;
  tempDateEnd: string | null;
  onDayClick: (d: string) => void;
  viewMonth: { year: number; month: number };
  setViewMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  isFirstMonth: boolean;
};

export default function CalendarMonth({
  year,
  month,
  today,
  tempDateStart,
  tempDateEnd,
  onDayClick,
  viewMonth,
  setViewMonth,
  isFirstMonth,
}: CalendarMonthProps) {
  const t = useTranslations("onboarding");
  const weekdays = useMemo(() => t("weekdays").split(","), [t]);

  const { daysInMonth, firstDayOfWeek } = useMemo(() => ({
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    firstDayOfWeek: new Date(year, month, 1).getDay(),
  }), [year, month]);

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isDisabled = (day: number) => new Date(year, month, day) < today;

  const isSelected = (day: number) => {
    const d = toDateStr(day);
    return d === tempDateStart || d === tempDateEnd;
  };

  const isInRange = (day: number) => {
    if (!tempDateStart || !tempDateEnd) return false;
    const d = toDateStr(day);
    return d > tempDateStart && d < tempDateEnd;
  };

  const monthLabel = t("calendarMonth", { year: String(year), month: String(month + 1) });

  const prevMonth = () =>
    setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });

  const nextMonth = () =>
    setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  return (
    <div className={!isFirstMonth ? "mt-6" : ""} role="grid" aria-label={monthLabel}>
      {/* 월 헤더 */}
      <div className="flex items-center gap-2 mb-3 ml-[4px]">
        {isFirstMonth && (
          <button
            type="button"
            onClick={prevMonth}
            className="text-[20px] text-neutral-400 leading-none -mt-[1px]"
            aria-label="Previous month"
          >
            ‹
          </button>
        )}
        <span className="text-[15px] font-semibold text-dark">{monthLabel}</span>
        {isFirstMonth && (
          <button
            type="button"
            onClick={nextMonth}
            className="text-[20px] text-neutral-400 leading-none -mt-[1px]"
            aria-label="Next month"
          >
            ›
          </button>
        )}
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-1" role="row">
        {weekdays.map((d) => (
          <div key={d} className="flex justify-center" role="columnheader">
            <span className="h-[32px] w-[32px] flex items-center justify-center text-[12px] text-[#737373]">{d}</span>
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-y-[5px]">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const disabled = isDisabled(day);
          const selected = isSelected(day);
          const inRange = isInRange(day);

          return (
            <div key={day} className="flex justify-center">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onDayClick(toDateStr(day))}
                aria-label={`${month + 1}/${day}`}
                aria-pressed={selected}
                className={`h-[32px] w-[32px] rounded-full text-[14px] font-medium transition-colors ${
                  disabled ? "text-[#C4C4C4]" :
                  selected ? "bg-lime text-[#2A2A2A] font-bold" :
                  inRange ? "bg-[#F7F7F7] text-[#2A2A2A]" :
                  "text-[#737373]"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
