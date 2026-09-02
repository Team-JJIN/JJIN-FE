"use client";

import { useTranslations } from "next-intl";
import CheckBox from "@/app/_components/ui/CheckBox";
import SelectChip from "@/app/_components/ui/SelectChip";
import { LocationIcon, CalendarIcon, PencilIcon } from "@/app/_components/icons";
import { TRANSPORTS } from "../_constants";
import { useRegionLabel } from "../_useRegionLabel";
import type { OnboardingData, Transport } from "../_types";

// 이 페이지 입력 필드 아이콘 색상
const ICON_COLOR = "text-[#9B9B9B]";
// 아이콘이 왼쪽에서 기존보다 12px 더 들어가도록 하는 여백
const FIELD_PADDING = "pl-3";

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
}: Step1ContentProps) {
  const t = useTranslations("onboarding");
  const regionLabel = useRegionLabel();

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">{t("step1Title")}</h1>

      {/* 여행 이름 */}
      <p className="mt-[14px] text-[14px] font-medium text-[#737373]">{t("tripName")}</p>
      <div className={`mt-[10px] flex w-full items-center gap-2 ${FIELD_PADDING}`}>
        <PencilIcon size={24} className={ICON_COLOR} />
        <input
          type="text"
          value={data.tripName}
          onChange={(e) => setData((d) => ({ ...d, tripName: e.target.value }))}
          placeholder={t("tripNamePlaceholder")}
          aria-label={t("tripName")}
          className="flex-1 bg-transparent text-[16px] font-medium text-dark outline-none placeholder:text-[#C4C4C4]"
        />
      </div>

      {/* 방문 지역 */}
      <p className="mt-[24px] text-[14px] font-medium text-[#737373]">{t("region")}</p>
      <button
        type="button"
        onClick={openRegionSheet}
        disabled={data.regionUndecided}
        aria-label={t("region")}
        className={`mt-[10px] flex w-full items-center gap-2 ${FIELD_PADDING} disabled:opacity-40`}
      >
        <LocationIcon className={ICON_COLOR} />
        <span className={`text-[16px] font-medium ${data.region ? "text-dark" : "text-[#C4C4C4]"}`}>
          {data.region ? regionLabel(data.region) : t("regionPlaceholder")}
        </span>
      </button>
      <div className="flex justify-end mt-2">
        <CheckBox
          checked={data.regionUndecided}
          onChange={() => setData((d) => ({ ...d, regionUndecided: !d.regionUndecided, region: "" }))}
          label={t("regionUndecided")}
        />
      </div>

      {/* 방문 날짜 */}
      <p className="mt-[24px] text-[14px] font-medium text-[#737373]">{t("dateRange")}</p>
      <button
        type="button"
        onClick={openDateSheet}
        aria-label={t("dateRange")}
        className={`mt-[10px] flex w-full items-center gap-2 ${FIELD_PADDING}`}
      >
        <CalendarIcon className={ICON_COLOR} />
        <span className={`text-[16px] font-medium ${data.dateStart ? "text-dark" : "text-[#C4C4C4]"}`}>
          {data.dateStart ? `${formatDate(data.dateStart)} - ${formatDate(data.dateEnd)}` : t("datePlaceholder")}
        </span>
      </button>

      {/* 하루 활동 시간대 */}
      <p className="mt-[24px] text-[14px] font-medium text-[#737373]">{t("activityTime")}</p>
      <div className="mt-[10px] flex items-center gap-3">
        <button
          type="button"
          onClick={openTimeSheetStart}
          aria-label={t("timeSheetStart")}
          className={`flex-1 rounded-[10px] border p-[10px] text-left ${timeSheet === "start" ? "border-[#CCFF00] bg-lime-light" : "border-[#E1E2E4]"}`}
        >
          <span className="text-[11px] text-[#737373]">{t("timeStart")}</span>
          <p className="mt-1 text-[20px] font-normal text-[#2A2A2A]">
            {String(data.timeStart % 12 || 12).padStart(2, "0")}:{minuteStart} <span className="text-[14px]">{data.timeStart < 12 ? "AM" : "PM"}</span>
          </p>
        </button>
        <span className="text-neutral-300 text-[16px]" aria-hidden="true">›</span>
        <button
          type="button"
          onClick={openTimeSheetEnd}
          aria-label={t("timeSheetEnd")}
          className={`flex-1 rounded-[10px] border p-[10px] text-left ${timeSheet === "end" ? "border-[#CCFF00] bg-lime-light" : "border-[#E1E2E4]"}`}
        >
          <span className="text-[11px] text-[#737373]">{t("timeEnd")}</span>
          <p className="mt-1 text-[20px] font-normal text-[#2A2A2A]">
            {String(data.timeEnd % 12 || 12).padStart(2, "0")}:{minuteEnd} <span className="text-[14px]">{data.timeEnd < 12 ? "AM" : "PM"}</span>
          </p>
        </button>
      </div>

      {/* 이동 수단 — 복수 선택 */}
      <p className="mt-[24px] text-[14px] font-medium text-[#737373]">{t("transport")}</p>
      <div className="mt-[10px] flex gap-2" role="group" aria-label={t("transport")}>
        {TRANSPORTS.map((tr) => (
          <SelectChip
            key={tr}
            label={t(tr)}
            selected={data.transport.includes(tr)}
            onToggle={() => setData((d) => ({
              ...d,
              transport: d.transport.includes(tr)
                ? d.transport.filter((item) => item !== tr)
                : [...d.transport, tr as Transport],
            }))}
          />
        ))}
      </div>
    </>
  );
}
