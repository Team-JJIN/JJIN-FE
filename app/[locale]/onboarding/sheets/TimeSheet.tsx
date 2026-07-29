"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import WheelPicker from "@/app/_components/ui/WheelPicker";
import type { OnboardingData } from "../_types";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const AMPM = ["AM", "PM"];

type TimeSheetProps = {
  open: boolean;
  timeSheet: "start" | "end" | null;
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  tempMinute: string;
  setTempMinute: (v: string) => void;
  onClose: () => void;
};

export default function TimeSheet({
  open,
  timeSheet,
  data,
  setData,
  tempMinute,
  setTempMinute,
  onClose,
}: TimeSheetProps) {
  const t = useTranslations("onboarding");

  const currentHour = timeSheet === "start" ? data.timeStart : data.timeEnd;
  const hourValue = useMemo(() => String((currentHour % 12) || 12), [currentHour]);
  const ampmValue = currentHour < 12 ? "AM" : "PM";

  const handleHourChange = (val: string) => {
    const h = Number(val);
    const isPM = currentHour >= 12;
    const newH = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    if (timeSheet === "start") setData((d) => ({ ...d, timeStart: newH }));
    else setData((d) => ({ ...d, timeEnd: newH }));
  };

  const handleAmpmChange = (val: string) => {
    const hour12 = currentHour % 12;
    const newH = val === "PM" ? hour12 + 12 : hour12;
    if (timeSheet === "start") setData((d) => ({ ...d, timeStart: newH }));
    else setData((d) => ({ ...d, timeEnd: newH }));
  };

  return (
    <BottomSheet
      open={open}
      title={timeSheet === "start" ? t("timeSheetStart") : t("timeSheetEnd")}
      onClose={onClose}
    >
      <div className="relative flex justify-center gap-6 py-4">
        {/* 선택 하이라이트 밴드 */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[40px] bg-[#F4FFD6] rounded-lg pointer-events-none" />

        <div className="relative w-[60px]">
          <WheelPicker items={HOURS} value={hourValue} onChange={handleHourChange} />
        </div>

        <div className="relative w-[60px]">
          <WheelPicker items={MINUTES} value={tempMinute} onChange={setTempMinute} />
        </div>

        <div className="relative w-[60px]">
          <WheelPicker items={AMPM} value={ampmValue} onChange={handleAmpmChange} />
        </div>
      </div>
    </BottomSheet>
  );
}
