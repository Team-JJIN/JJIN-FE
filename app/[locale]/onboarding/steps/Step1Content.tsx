"use client";

import CheckBox from "@/app/_components/ui/CheckBox";
import SelectChip from "@/app/_components/ui/SelectChip";
import { LocationIcon, CalendarIcon } from "@/app/_components/icons";
import { TRANSPORTS } from "../_constants";
import type { OnboardingData } from "../_types";

type Step1ContentProps = {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  formatDate: (d: string | null) => string;
  openRegionSheet: () => void;
  openDateSheet: () => void;
  openTimeSheetStart: () => void;
  openTimeSheetEnd: () => void;
  minuteStart: string;
  minuteEnd: string;
  timeSheet: "start" | "end" | null;
  t: (key: string) => string;
};

export default function Step1Content({
  data,
  setData,
  formatDate,
  openRegionSheet,
  openDateSheet,
  openTimeSheetStart,
  openTimeSheetEnd,
  minuteStart,
  minuteEnd,
  timeSheet,
  t,
}: Step1ContentProps) {
  return (
    <>
      <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">여행 일정과 이동 방식</h1>

      {/* 방문 지역 */}
      <p className="mt-[14px] text-[14px] font-medium text-[#737373]">방문 지역</p>
      <button
        type="button"
        onClick={openRegionSheet}
        disabled={data.regionUndecided}
        className="mt-[10px] flex w-full items-center gap-2 pb-2 border-b border-neutral-200 disabled:opacity-40"
      >
        <LocationIcon className="text-[#C4C4C4]" />
        <span className="text-[16px] font-medium text-[#C4C4C4]">
          {data.region || "어디로 방문하시나요?"}
        </span>
      </button>
      <div className="flex justify-end mt-2">
        <CheckBox
          checked={data.regionUndecided}
          onChange={() => setData((d) => ({ ...d, regionUndecided: !d.regionUndecided, region: "" }))}
          label="아직 못 정했어요"
        />
      </div>

      {/* 방문 날짜 */}
      <p className="mt-[12px] text-[14px] font-medium text-[#737373]">방문 날짜</p>
      <button
        type="button"
        onClick={openDateSheet}
        className="mt-[10px] flex w-full items-center gap-2 pb-2 border-b border-neutral-200"
      >
        <CalendarIcon className="text-[#C4C4C4]" />
        <span className="text-[16px] font-medium text-[#C4C4C4]">
          {data.dateStart ? `${formatDate(data.dateStart)} ~ ${formatDate(data.dateEnd)}` : "언제 방문하시나요?"}
        </span>
      </button>

      {/* 하루 활동 시간대 */}
      <p className="mt-[24px] text-[14px] font-medium text-[#737373]">하루 활동 시간대</p>
      <div className="mt-[10px] flex items-center gap-3">
        <button
          type="button"
          onClick={openTimeSheetStart}
          className={`flex-1 rounded-[10px] border p-[10px] text-left ${timeSheet === "start" ? "border-[#CCFF00] bg-lime-light" : "border-[#E1E2E4]"}`}
        >
          <span className="text-[11px] text-[#737373]">시작</span>
          <p className="mt-1 text-[20px] font-normal text-[#2A2A2A]">
            {String(data.timeStart % 12 || 12).padStart(2, "0")}:{minuteStart} <span className="text-[14px]">{data.timeStart < 12 ? "AM" : "PM"}</span>
          </p>
        </button>
        <span className="text-neutral-300 text-[16px]">›</span>
        <button
          type="button"
          onClick={openTimeSheetEnd}
          className={`flex-1 rounded-[10px] border p-[10px] text-left ${timeSheet === "end" ? "border-[#CCFF00] bg-lime-light" : "border-[#E1E2E4]"}`}
        >
          <span className="text-[11px] text-[#737373]">종료</span>
          <p className="mt-1 text-[20px] font-normal text-[#2A2A2A]">
            {String(data.timeEnd % 12 || 12).padStart(2, "0")}:{minuteEnd} <span className="text-[14px]">{data.timeEnd < 12 ? "AM" : "PM"}</span>
          </p>
        </button>
      </div>

      {/* 이동 수단 — 복수 선택 */}
      <p className="mt-[24px] text-[14px] font-medium text-[#737373]">이동 수단</p>
      <div className="mt-[10px] flex gap-2">
        {TRANSPORTS.map((tr) => (
          <SelectChip
            key={tr}
            label={t(tr)}
            selected={data.transport.includes(tr)}
            onToggle={() => setData((d) => ({
              ...d,
              transport: d.transport.includes(tr)
                ? d.transport.filter((t) => t !== tr)
                : [...d.transport, tr],
            }))}
          />
        ))}
      </div>
    </>
  );
}
