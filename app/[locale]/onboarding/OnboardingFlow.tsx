"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import TopBarBack from "@/app/_components/ui/TopBarBack";
import PageTransition from "@/app/_components/PageTransition";

import { SUB_CATEGORIES } from "./_constants";
import type { OnboardingData } from "./_types";

import Step1Content from "./steps/Step1Content";
import Step2Content from "./steps/Step2Content";
import Step3Content from "./steps/Step3Content";
import Step4Content from "./steps/Step4Content";

import RegionSheet from "./sheets/RegionSheet";
import DateSheet from "./sheets/DateSheet";
import TimeSheet from "./sheets/TimeSheet";

export default function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    region: "",
    regionUndecided: false,
    dateStart: null,
    dateEnd: null,
    timeStart: 9,
    timeEnd: 22,
    transport: [],
    categories: [],
    subCategories: [],
    level: "",
  });

  // 바텀시트 상태
  const [regionSheet, setRegionSheet] = useState(false);
  const [dateSheet, setDateSheet] = useState(false);
  const [timeSheet, setTimeSheet] = useState<"start" | "end" | null>(null);
  const [tempMinute, setTempMinute] = useState("00");
  const [minuteStart, setMinuteStart] = useState("00");
  const [minuteEnd, setMinuteEnd] = useState("00");

  // 바텀시트 임시 값
  const [tempRegion, setTempRegion] = useState("");
  const [tempDateStart, setTempDateStart] = useState<string | null>(null);
  const [tempDateEnd, setTempDateEnd] = useState<string | null>(null);
  const [dateSelecting, setDateSelecting] = useState<"start" | "end">("start");
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // 캘린더 로직 (바텀시트 내부에서 사용)
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const canProceed = () => {
    switch (step) {
      case 1: return (data.dateStart && data.dateEnd) && (data.region || data.regionUndecided) && data.transport.length > 0;
      case 2: return data.categories.length >= 2 && data.categories.length <= 4;
      case 3: return data.categories.every((cat) => (SUB_CATEGORIES[cat] ?? []).some((sub) => data.subCategories.includes(sub)));
      case 4: return data.level !== "";
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
    else alert("온보딩 완료!"); // TODO: API 제출 후 메인 이동
  };

  const handlePrev = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push(`/${locale}/auth/login`);
  };

  const toggleCategory = (cat: string) => {
    setData((d) => {
      if (d.categories.includes(cat)) return { ...d, categories: d.categories.filter((c) => c !== cat) };
      if (d.categories.length >= 4) return d;
      return { ...d, categories: [...d.categories, cat] };
    });
  };

  const toggleSubCategory = (sub: string) => {
    setData((d) => ({
      ...d,
      subCategories: d.subCategories.includes(sub)
        ? d.subCategories.filter((c) => c !== sub)
        : [...d.subCategories, sub],
    }));
  };

  const formatDate = (d: string | null) => d ? d.replace(/-/g, ".") : "";

  const handleDayClick2 = (d: string) => {
    if (dateSelecting === "start") {
      setTempDateStart(d);
      setTempDateEnd(null);
      setDateSelecting("end");
    } else {
      if (tempDateStart && d <= tempDateStart) {
        setTempDateStart(d);
        setTempDateEnd(null);
      } else {
        setTempDateEnd(d);
        setDateSelecting("start");
      }
    }
  };

  return (
    <PageTransition>
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 상단: 뒤로 + 건너뛰기 */}
      <TopBarBack onBack={handlePrev} rightText="건너뛰기" />

      {/* 프로그레스 — 일직선 게이지 */}
      <div className="relative mt-2 mb-[24px] h-[6px] rounded-full bg-neutral-200 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-lime transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pb-4">
        {step === 1 && (
          <Step1Content
            data={data}
            setData={setData}
            formatDate={formatDate}
            openRegionSheet={() => { if (!data.regionUndecided) { setTempRegion(data.region); setRegionSheet(true); } }}
            openDateSheet={() => { setTempDateStart(data.dateStart); setTempDateEnd(data.dateEnd); setDateSheet(true); }}
            openTimeSheetStart={() => { setTempMinute(minuteStart); setTimeSheet("start"); }}
            openTimeSheetEnd={() => { setTempMinute(minuteEnd); setTimeSheet("end"); }}
            minuteStart={minuteStart}
            minuteEnd={minuteEnd}
            timeSheet={timeSheet}
            t={t}
          />
        )}

        {step === 2 && (
          <Step2Content
            data={data}
            toggleCategory={toggleCategory}
            t={t}
          />
        )}

        {step === 3 && (
          <Step3Content
            categories={data.categories}
            subCategories={data.subCategories}
            toggleSubCategory={toggleSubCategory}
            t={t}
          />
        )}

        {step === 4 && (
          <Step4Content
            data={data}
            setData={setData}
            t={t}
          />
        )}
      </div>

      {/* 안내 칩 (step 2에서만) */}
      {step === 2 && (
        <div className="flex justify-center mb-[30px]">
          <span className="rounded-full bg-[#F4FFD6] px-4 py-[10px] text-[12px] font-medium text-dark">
            최대 4개까지 선택할 수 있어요
          </span>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className={`flex pb-[43px] ${step === 4 ? "" : "gap-[16px]"}`}>
        {step !== 4 && (
          <button
            type="button"
            onClick={handlePrev}
            className="h-[48px] flex-1 rounded-[16px] bg-[#F7F7F7] text-[15px] font-semibold text-dark"
          >
            이전
          </button>
        )}
        <div className="flex-1">
          <BigButton fullWidth disabled={!canProceed()} onClick={handleNext}>
            {step === 4 ? t("start") : t("next")}
          </BigButton>
        </div>
      </div>

      {/* === 바텀시트: 지역 선택 === */}
      <RegionSheet
        open={regionSheet}
        tempRegion={tempRegion}
        setTempRegion={setTempRegion}
        onClose={() => setRegionSheet(false)}
        onConfirm={() => { setData((d) => ({ ...d, region: tempRegion })); setRegionSheet(false); }}
      />

      {/* === 바텀시트: 날짜 선택 === */}
      <DateSheet
        open={dateSheet}
        tempDateStart={tempDateStart}
        tempDateEnd={tempDateEnd}
        onDayClick={handleDayClick2}
        onReset={() => { setTempDateStart(null); setTempDateEnd(null); setDateSelecting("start"); }}
        onClose={() => setDateSheet(false)}
        onConfirm={() => { setData((d) => ({ ...d, dateStart: tempDateStart, dateEnd: tempDateEnd })); setDateSheet(false); }}
        viewMonth={viewMonth}
        setViewMonth={setViewMonth}
        today={today}
      />

      {/* === 바텀시트: 시간 선택 (휠 다이얼) === */}
      <TimeSheet
        open={!!timeSheet}
        timeSheet={timeSheet}
        data={data}
        setData={setData}
        tempMinute={tempMinute}
        setTempMinute={setTempMinute}
        onClose={() => {
          if (timeSheet === "start") setMinuteStart(tempMinute);
          else setMinuteEnd(tempMinute);
          setTimeSheet(null);
        }}
      />
    </div>
    </PageTransition>
  );
}
