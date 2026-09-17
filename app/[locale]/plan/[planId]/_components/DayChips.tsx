/**
 * @component DayChips
 * 일차 선택 칩 + 활성 일차 날짜. 편집 중에는 disabled로 다른 일차 이동을 막는다(드래프트 유실 방지).
 */
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { sectionEnter } from "@/app/_components/motion/tokens";
import { addDays, formatDotDate, parseIsoDate } from "@/lib/date";
import type { PlanDay } from "../../_types";

interface DayChipsProps {
  dayCount: number;
  startDate: string;
  days: PlanDay[];
  activeDay: number;
  onSelect: (i: number) => void;
  disabled: boolean;
}

export default function DayChips({
  dayCount,
  startDate,
  days,
  activeDay,
  onSelect,
  disabled,
}: DayChipsProps) {
  const t = useTranslations("plan");

  const explicitDate = days.find((d) => d.dayIndex === activeDay)?.date;
  const startParsed = parseIsoDate(startDate);
  const parsedDate = explicitDate
    ? parseIsoDate(explicitDate)
    : startParsed
      ? addDays(startParsed, activeDay)
      : null;
  const dateLabel = parsedDate ? formatDotDate(parsedDate) : "";

  return (
    <motion.div
      {...sectionEnter(1)}
      className="flex h-[27px] items-end justify-between px-4"
    >
      <div className="flex gap-[5px]">
        {Array.from({ length: dayCount }, (_, i) => {
          const selected = i === activeDay;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (disabled) return;
                onSelect(i);
              }}
              aria-pressed={selected}
              aria-disabled={disabled ? "true" : undefined}
              className={`h-[27px] rounded-full px-3 py-1 text-[12px] font-medium leading-[1.6] transition-colors ${
                selected ? "bg-lime-vivid text-ink" : "bg-surface text-subtext"
              } ${!disabled ? "motion-safe:active:scale-[0.96]" : ""}`}
            >
              {t("dayChip", { n: i + 1 })}
            </button>
          );
        })}
      </div>
      <span className="text-[12px] font-medium leading-[1.6] text-muted">
        {dateLabel}
      </span>
    </motion.div>
  );
}
