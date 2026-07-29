"use client";

import { useTranslations } from "next-intl";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import BigButton from "@/app/_components/ui/BigButton";
import ResetButton from "@/app/_components/ui/ResetButton";
import CalendarMonth from "./CalendarMonth";

type DateSheetProps = {
  open: boolean;
  tempDateStart: string | null;
  tempDateEnd: string | null;
  onDayClick: (d: string) => void;
  onReset: () => void;
  onClose: () => void;
  onConfirm: () => void;
  viewMonth: { year: number; month: number };
  setViewMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  today: Date;
};

export default function DateSheet({
  open,
  tempDateStart,
  tempDateEnd,
  onDayClick,
  onReset,
  onClose,
  onConfirm,
  viewMonth,
  setViewMonth,
  today,
}: DateSheetProps) {
  const t = useTranslations("onboarding");

  return (
    <BottomSheet
      open={open}
      title={t("dateSheetTitle")}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between">
          <ResetButton onClick={onReset} label={t("reset")} />
          <BigButton
            disabled={!tempDateStart || !tempDateEnd}
            onClick={onConfirm}
            className="w-[164px] rounded-[16px]"
          >
            {t("selectComplete")}
          </BigButton>
        </div>
      }
    >
      {/* 두 달 연속 캘린더 — 헤더에서 20px 아래 */}
      <div className="mt-[20px]">
        {[0, 1].map((offset) => {
          const m = (viewMonth.month + offset) % 12;
          const y = viewMonth.year + Math.floor((viewMonth.month + offset) / 12);

          return (
            <CalendarMonth
              key={`${y}-${m}`}
              year={y}
              month={m}
              today={today}
              tempDateStart={tempDateStart}
              tempDateEnd={tempDateEnd}
              onDayClick={onDayClick}
              viewMonth={viewMonth}
              setViewMonth={setViewMonth}
              isFirstMonth={offset === 0}
            />
          );
        })}
      </div>
    </BottomSheet>
  );
}
