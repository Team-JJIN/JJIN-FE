"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { sectionEnter } from "@/app/_components/motion/tokens";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import TopBarBack from "@/app/_components/ui/TopBarBack";
import { getApiErrorMessage, ApiError } from "@/app/_api/client";
import {
  submitOnboarding,
  buildOnboardingRequest,
} from "@/app/_api/onboarding";
import { planKeys } from "@/app/[locale]/plan/_hooks/usePlanQueries";
import useRoutePrefetch from "@/app/_components/navigation/useRoutePrefetch";

import { SUB_CATEGORIES } from "./_constants";
import type { OnboardingData, Category } from "./_types";

import Step1Content from "./steps/Step1Content";
import Step2Content from "./steps/Step2Content";
import Step3Content from "./steps/Step3Content";
import Step4Content from "./steps/Step4Content";

import RegionSheet from "./sheets/RegionSheet";
import DateSheet from "./sheets/DateSheet";
import TimeSheet from "./sheets/TimeSheet";

// "다 좋아요"(allFood)와 상호배타인 나머지 음식점 세부 취향 키.
const OTHER_FOOD_SUBS = ["korean", "cafe", "bar"];

export default function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isNavigating, startNavigationTransition] = useTransition();
  // 앱 내부 알림(시스템 alert 대체). 제출 실패 등의 사유를 화면 안에 잠깐 띄운다.
  const [toast, setToast] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    tripName: "",
    region: "",
    regionId: null,
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
  const [tempRegionId, setTempRegionId] = useState<number | null>(null);
  const [tempDateStart, setTempDateStart] = useState<string | null>(null);
  const [tempDateEnd, setTempDateEnd] = useState<string | null>(null);
  const [dateSelecting, setDateSelecting] = useState<"start" | "end">("start");
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return (
          !!(data.dateStart && data.dateEnd) &&
          !!(data.region || data.regionUndecided) &&
          data.transport.length > 0
        );
      case 2:
        return data.categories.length >= 2 && data.categories.length <= 4;
      case 3:
        return data.categories.every((cat) =>
          (SUB_CATEGORIES[cat] ?? []).some((sub) =>
            data.subCategories.includes(sub),
          ),
        );
      case 4:
        return data.level !== "";
      default:
        return false;
    }
  }, [step, data]);

  // 홈으로 이동(일정 생성 완료 / 건너뛰기 공통). 이 화면은 여행 일정 생성 화면이라
  // 토큰/역할 갱신 없이 홈으로 돌아간다.
  const homeHref = `/${locale}/home`;
  useRoutePrefetch(homeHref, step === 1 || isCompleting);

  const goHome = useCallback(
    () => startNavigationTransition(() => router.push(homeHref)),
    [router, homeHref, startNavigationTransition],
  );

  // 앱 내부 알림을 띄우고 3초 뒤 자동으로 닫는다.
  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  // S4 "시작하기": S1~S4 입력을 여행 일정 생성 API로 전송한다.
  // 이 API는 토큰/역할을 갱신하지 않고 travelPlanId만 반환하므로, 완료 후 홈으로 이동한다.
  const submitAndComplete = useCallback(async () => {
    if (isCompleting) return;
    setIsCompleting(true);
    try {
      const body = buildOnboardingRequest(data, minuteStart, minuteEnd);
      await submitOnboarding(body);
      // 새로 생성한 일정이 홈 목록에 즉시 반영되도록 목록 캐시를 무효화한다.
      await queryClient.invalidateQueries({ queryKey: planKeys.list() });
      goHome();
    } catch (err) {
      setIsCompleting(false);
      if (process.env.NODE_ENV !== "production" && err instanceof ApiError) {
        console.error("[travel-plans] API error:", {
          status: err.status,
          message: err.message,
          detail: err.detail,
        });
      }
      showToast(getApiErrorMessage(err, t("errorSubmitFailed")));
    }
  }, [
    isCompleting,
    data,
    minuteStart,
    minuteEnd,
    goHome,
    queryClient,
    t,
    showToast,
  ]);

  const handleNext = useCallback(async () => {
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      await submitAndComplete();
    }
  }, [step, submitAndComplete]);

  const handlePrev = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
    else goHome();
  }, [step, goHome]);

  const toggleCategory = useCallback((cat: Category) => {
    setData((d) => {
      if (d.categories.includes(cat)) {
        const subsToRemove = SUB_CATEGORIES[cat] ?? [];
        return {
          ...d,
          categories: d.categories.filter((c) => c !== cat),
          subCategories: d.subCategories.filter(
            (s) => !subsToRemove.includes(s),
          ),
        };
      }
      if (d.categories.length >= 4) return d;
      return { ...d, categories: [...d.categories, cat] };
    });
  }, []);

  const toggleSubCategory = useCallback((sub: string) => {
    setData((d) => {
      const isRemoving = d.subCategories.includes(sub);
      if (isRemoving) {
        return {
          ...d,
          subCategories: d.subCategories.filter((c) => c !== sub),
        };
      }
      // "다 좋아요"(allFood, LIKE_ALL_FOOD)는 다른 음식점 세부 취향과 함께 선택할 수 없다(서버 제약).
      // 상호배타로 처리: allFood 선택 시 다른 음식 취향 해제, 다른 음식 취향 선택 시 allFood 해제.
      let next = d.subCategories;
      if (sub === "allFood") {
        next = next.filter((c) => !OTHER_FOOD_SUBS.includes(c));
      } else if (OTHER_FOOD_SUBS.includes(sub)) {
        next = next.filter((c) => c !== "allFood");
      }
      return { ...d, subCategories: [...next, sub] };
    });
  }, []);

  // "2025-07-22" → "07.22.(수)" 형식. 요일은 locale별 weekdays i18n 사용.
  const formatDate = useCallback(
    (d: string | null) => {
      if (!d) return "";
      const [, month, day] = d.split("-");
      const weekday = t("weekdays").split(",")[new Date(d).getDay()];
      return `${month}.${day}.(${weekday})`;
    },
    [t],
  );

  const handleDayClick = useCallback(
    (d: string) => {
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
    },
    [dateSelecting, tempDateStart],
  );

  const openRegionSheet = useCallback(() => {
    if (!data.regionUndecided) {
      setTempRegion(data.region);
      setTempRegionId(data.regionId);
      setRegionSheet(true);
    }
  }, [data.regionUndecided, data.region, data.regionId]);

  const openDateSheet = useCallback(() => {
    setTempDateStart(data.dateStart);
    setTempDateEnd(data.dateEnd);
    setDateSheet(true);
  }, [data.dateStart, data.dateEnd]);

  const openTimeSheetStart = useCallback(() => {
    setTempMinute(minuteStart);
    setTimeSheet("start");
  }, [minuteStart]);

  const openTimeSheetEnd = useCallback(() => {
    setTempMinute(minuteEnd);
    setTimeSheet("end");
  }, [minuteEnd]);

  const handleRegionConfirm = useCallback(() => {
    setData((d) => ({ ...d, region: tempRegion, regionId: tempRegionId }));
    setRegionSheet(false);
  }, [tempRegion, tempRegionId]);

  const handleDateReset = useCallback(() => {
    setTempDateStart(null);
    setTempDateEnd(null);
    setDateSelecting("start");
  }, []);

  const handleDateConfirm = useCallback(() => {
    setData((d) => ({ ...d, dateStart: tempDateStart, dateEnd: tempDateEnd }));
    setDateSheet(false);
  }, [tempDateStart, tempDateEnd]);

  const handleTimeClose = useCallback(() => {
    if (timeSheet === "start") setMinuteStart(tempMinute);
    else setMinuteEnd(tempMinute);
    setTimeSheet(null);
  }, [timeSheet, tempMinute]);

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      <TopBarBack
        onBack={handlePrev}
        pending={step === 1 && isNavigating}
        backLabel={t("prev")}
      />

      {/* 프로그레스 */}
      <div className="relative mt-2 mb-[24px] h-[6px] rounded-full bg-neutral-200 overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-lime transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* 콘텐츠 — 스텝 전환 시 등장 애니메이션 */}
      <div className="flex-1 overflow-y-auto pb-4">
        <AnimatePresence mode="wait">
          <motion.div key={step} {...sectionEnter(0)}>
            {step === 1 && (
              <Step1Content
                data={data}
                setData={setData}
                formatDate={formatDate}
                openRegionSheet={openRegionSheet}
                openDateSheet={openDateSheet}
                openTimeSheetStart={openTimeSheetStart}
                openTimeSheetEnd={openTimeSheetEnd}
                minuteStart={minuteStart}
                minuteEnd={minuteEnd}
                timeSheet={timeSheet}
              />
            )}

            {step === 2 && (
              <Step2Content data={data} toggleCategory={toggleCategory} />
            )}

            {step === 3 && (
              <Step3Content
                categories={data.categories}
                subCategories={data.subCategories}
                toggleSubCategory={toggleSubCategory}
              />
            )}

            {step === 4 && <Step4Content data={data} setData={setData} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 안내 칩 (step 2에서만) */}
      {step === 2 && (
        <div className="flex justify-center mb-[30px]">
          <span className="rounded-full bg-[#F4FFD6] px-4 py-[10px] text-[12px] font-medium text-dark">
            {t("maxFourCategories")}
          </span>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className={`flex pb-[43px] ${step === 4 ? "" : "gap-[16px]"}`}>
        {step !== 4 && (
          <button
            type="button"
            onClick={handlePrev}
            disabled={isCompleting || isNavigating}
            aria-busy={step === 1 && isNavigating}
            className="h-[48px] flex-1 rounded-[16px] bg-[#F7F7F7] text-[15px] font-semibold text-dark disabled:opacity-50"
          >
            {t("prev")}
          </button>
        )}
        <div className="flex-1">
          <BigButton
            fullWidth
            disabled={!canProceed || isCompleting || isNavigating}
            isLoading={step === 4 && (isCompleting || isNavigating)}
            onClick={handleNext}
            aria-label={step === 4 ? t("start") : t("next")}
          >
            {step === 4 ? t("start") : t("next")}
          </BigButton>
        </div>
      </div>

      {/* 앱 내부 알림(토스트) — 시스템 alert 대체 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute inset-x-0 bottom-[110px] z-50 flex justify-center px-[20px]"
          >
            <span className="max-w-full rounded-full bg-dark px-4 py-[10px] text-center text-[12px] font-medium text-white">
              {toast}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 바텀시트: 지역 선택 */}
      <RegionSheet
        open={regionSheet}
        tempRegion={tempRegion}
        setTempRegionId={setTempRegionId}
        setTempRegion={setTempRegion}
        onClose={() => setRegionSheet(false)}
        onConfirm={handleRegionConfirm}
      />

      {/* 바텀시트: 날짜 선택 */}
      <DateSheet
        open={dateSheet}
        tempDateStart={tempDateStart}
        tempDateEnd={tempDateEnd}
        onDayClick={handleDayClick}
        onReset={handleDateReset}
        onClose={() => setDateSheet(false)}
        onConfirm={handleDateConfirm}
        viewMonth={viewMonth}
        setViewMonth={setViewMonth}
        today={today}
      />

      {/* 바텀시트: 시간 선택 */}
      <TimeSheet
        open={!!timeSheet}
        timeSheet={timeSheet}
        data={data}
        setData={setData}
        tempMinute={tempMinute}
        setTempMinute={setTempMinute}
        onClose={handleTimeClose}
      />
    </div>
  );
}
