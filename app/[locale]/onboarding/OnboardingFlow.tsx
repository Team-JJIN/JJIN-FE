"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Button from "@/app/_components/ui/Button";
import BackButton from "@/app/_components/ui/BackButton";
import DateRangePicker from "@/app/_components/ui/DateRangePicker";
import RangeSlider from "@/app/_components/ui/RangeSlider";
import Checkbox from "@/app/_components/ui/Checkbox";
import Dropdown from "@/app/_components/ui/Dropdown";

// 이동 수단
const TRANSPORTS = ["walking", "publicTransit", "car"] as const;

// 지역 (광역시 + 도)
const REGIONS = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기도", "강원도", "충청북도", "충청남도",
  "전라북도", "전라남도", "경상북도", "경상남도", "제주도",
];

// 대분류
const CATEGORIES = [
  "food", "experience", "nature", "history",
  "culture", "shopping", "festival", "leisure",
] as const;

// 체험 레벨
const LEVELS = ["light", "normal", "deep"] as const;

// 중분류 데이터
const SUB_CATEGORIES: Record<string, string[]> = {
  food: ["한식", "카페·찻집", "주점", "다 좋아요"],
  experience: ["전통체험", "산사체험", "이색체험"],
  nature: ["산·숲", "바다·해변", "호수·강", "섬", "공원"],
  history: ["궁궐", "유적지", "박물관", "전통 마을"],
  culture: ["갤러리", "공연·뮤지컬", "거리 예술", "사찰"],
  shopping: ["전통시장", "로컬 숍", "면세점", "빈티지"],
  festival: ["축제", "공연·행사", "불꽃놀이", "야시장"],
  leisure: ["서핑", "스키", "등산", "자전거", "수상스포츠"],
};

type OnboardingData = {
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: number;
  timeEnd: number;
  transport: string;
  region: string;
  regionUndecided: boolean;
  categories: string[];
  subCategories: string[];
  level: string;
};

export default function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const locale = useLocale();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    dateStart: null,
    dateEnd: null,
    timeStart: 7,
    timeEnd: 21,
    transport: "",
    region: "",
    regionUndecided: false,
    categories: [],
    subCategories: [],
    level: "",
  });

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.transport !== "" && (data.region !== "" || data.regionUndecided);
      case 2:
        return data.categories.length >= 2 && data.categories.length <= 4;
      case 3:
        return data.categories.every((cat) =>
          (SUB_CATEGORIES[cat] ?? []).some((sub) => data.subCategories.includes(sub))
        );
      case 4:
        return data.level !== "";
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
    else {
      // TODO: submit onboarding data to API
      // 완료 — 이동할 페이지 없음 (추후 메인으로 연결)
      alert("온보딩 완료!");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push(`/${locale}/auth/login`);
  };

  const toggleCategory = (cat: string) => {
    setData((d) => {
      const exists = d.categories.includes(cat);
      if (exists) return { ...d, categories: d.categories.filter((c) => c !== cat) };
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

  const formatTime = (h: number) => `${String(h).padStart(2, "0")}:00`;

  return (
    <div className="flex h-dvh flex-col bg-white px-5">
      {/* 상단: 뒤로가기 */}
      <div className="pt-[4vh]">
        <BackButton onClick={handleBack} />
      </div>

      {/* 프로그레스바 */}
      <div className="flex gap-1 mt-2 mb-4">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${s <= step ? "bg-blue-500" : "bg-neutral-200"}`}
          />
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4">
        {/* === Step 1: 여행 일정과 이동 방식 === */}
        {step === 1 && (
          <>
            <h1 className="text-xl font-bold text-neutral-900">{t("step1Title")}</h1>

            <div className="mt-6">
              <DateRangePicker
                startDate={data.dateStart}
                endDate={data.dateEnd}
                onChange={(s, e) => setData((d) => ({ ...d, dateStart: s, dateEnd: e }))}
                placeholder={t("dateRange")}
              />
            </div>

            <div className="mt-6">
              <p className="text-sm text-neutral-600 mb-3">{t("activityTime")}</p>
              <div className="rounded-xl border border-neutral-200 px-4 py-3">
                <RangeSlider
                  min={7}
                  max={24}
                  startVal={data.timeStart}
                  endVal={data.timeEnd}
                  onChange={(s, e) => setData((d) => ({ ...d, timeStart: s, timeEnd: e }))}
                  formatLabel={formatTime}
                />
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-neutral-600 mb-3">{t("transport")}</p>
              <div className="flex gap-2">
                {TRANSPORTS.map((tr) => (
                  <button
                    key={tr}
                    type="button"
                    onClick={() => setData((d) => ({ ...d, transport: tr }))}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      data.transport === tr
                        ? "border-blue-400 bg-blue-50 text-blue-600"
                        : "border-neutral-200 text-neutral-700"
                    }`}
                  >
                    {t(tr)}
                    {data.transport === tr && " ✓"}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-neutral-600 mb-3">{t("region")}</p>
              <Dropdown
                value={data.region}
                options={REGIONS}
                onChange={(val) => setData((d) => ({ ...d, region: val }))}
                placeholder={t("region")}
                disabled={data.regionUndecided}
              />
              <div className="mt-3">
                <Checkbox
                  label={t("regionUndecided")}
                  checked={data.regionUndecided}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      regionUndecided: (e.target as HTMLInputElement).checked,
                      region: "",
                    }))
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* === Step 2: 취향 대분류 === */}
        {step === 2 && (
          <>
            <h1 className="text-xl font-bold text-neutral-900">{t("step2Title")}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t("step2Subtitle")}</p>

            <div className="flex flex-wrap gap-2 mt-6">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    data.categories.includes(cat)
                      ? "border-blue-400 bg-blue-50 text-blue-600"
                      : "border-neutral-200 text-neutral-700"
                  }`}
                >
                  {t(`categories.${cat}`)}
                  {data.categories.includes(cat) && " ✓"}
                </button>
              ))}
            </div>
          </>
        )}

        {/* === Step 3: 취향 중분류 === */}
        {step === 3 && (
          <>
            <h1 className="text-xl font-bold text-neutral-900">{t("step3Title")}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t("step3Subtitle")}</p>

            <div className="flex flex-col gap-3 mt-6">
              {data.categories.map((cat) => (
                <div key={cat} className="rounded-xl border border-neutral-200 px-4 py-3">
                  <p className="text-sm font-semibold text-neutral-900 mb-2">
                    {t(`categories.${cat}`)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(SUB_CATEGORIES[cat] ?? []).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubCategory(sub)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          data.subCategories.includes(sub)
                            ? "border-blue-400 bg-blue-50 text-blue-600"
                            : "border-neutral-200 text-neutral-600"
                        }`}
                      >
                        {sub}
                        {data.subCategories.includes(sub) && " ✓"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* === Step 4: 체험 레벨 === */}
        {step === 4 && (
          <>
            <h1 className="text-xl font-bold text-neutral-900">{t("step4Title")}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t("step4Subtitle")}</p>

            <div className="flex flex-col gap-3 mt-6">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, level: lvl }))}
                  className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                    data.level === lvl
                      ? "border-blue-400 bg-white"
                      : "border-neutral-200 bg-white"
                  }`}
                >
                  <span className={`text-base font-bold ${data.level === lvl ? "text-blue-600" : "text-neutral-900"}`}>
                    {t(lvl)}
                    {data.level === lvl && " ✓"}
                  </span>
                  <span className="block mt-1 text-xs text-neutral-500">
                    {t(`${lvl}Desc`)}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="pb-8">
        <Button fullWidth disabled={!canProceed()} onClick={handleNext}>
          {step === 4 ? t("start") : t("next")}
        </Button>
      </div>
    </div>
  );
}
