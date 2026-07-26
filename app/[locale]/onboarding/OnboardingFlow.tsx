"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import TopBarBack from "@/app/_components/ui/TopBarBack";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import CheckBox from "@/app/_components/ui/CheckBox";
import ResetButton from "@/app/_components/ui/ResetButton";
import SelectChip from "@/app/_components/ui/SelectChip";
import WheelPicker from "@/app/_components/ui/WheelPicker";
import PageTransition from "@/app/_components/PageTransition";

// 지역 칩 (고정 순서)
const REGIONS = [
  "서울", "부산", "인천", "제주", "전주", "경주",
  "강릉", "속초", "대구", "광주", "여수", "춘천",
];

// 이동 수단
const TRANSPORTS = ["walking", "publicTransit", "car"] as const;

// 대분류
const CATEGORIES = [
  "food", "experience", "nature", "history",
  "culture", "shopping", "festival", "leisure",
] as const;

// 중분류
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

const LEVELS = ["light", "normal", "deep"] as const;

type OnboardingData = {
  region: string;
  regionUndecided: boolean;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: number;
  timeEnd: number;
  transport: string[];
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
        {/* Step 1 */}
        {step === 1 && (
          <>
            <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">여행 일정과 이동 방식</h1>

            {/* 방문 지역 */}
            <p className="mt-[14px] text-[14px] font-medium text-[#737373]">방문 지역</p>
            <button
              type="button"
              onClick={() => { if (!data.regionUndecided) { setTempRegion(data.region); setRegionSheet(true); } }}
              disabled={data.regionUndecided}
              className="mt-[10px] flex w-full items-center gap-2 pb-2 border-b border-neutral-200 disabled:opacity-40"
            >
              <img src="/image/location-icon.svg" alt="" width={20} height={20} />
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
              onClick={() => { setTempDateStart(data.dateStart); setTempDateEnd(data.dateEnd); setDateSheet(true); }}
              className="mt-[10px] flex w-full items-center gap-2 pb-2 border-b border-neutral-200"
            >
              <img src="/image/calendar-icon.svg" alt="" width={20} height={20} />
              <span className="text-[16px] font-medium text-[#C4C4C4]">
                {data.dateStart ? `${formatDate(data.dateStart)} ~ ${formatDate(data.dateEnd)}` : "언제 방문하시나요?"}
              </span>
            </button>

            {/* 하루 활동 시간대 */}
            <p className="mt-[24px] text-[14px] font-medium text-[#737373]">하루 활동 시간대</p>
            <div className="mt-[10px] flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setTempMinute(minuteStart); setTimeSheet("start"); }}
                className={`flex-1 rounded-[10px] border p-[10px] text-left ${timeSheet === "start" ? "border-[#CCFF00] bg-lime-light" : "border-[#E1E2E4]"}`}
              >
                <span className="text-[11px] text-[#737373]">시작</span>
                <p className="mt-1 font-[Noto_Sans_KR] text-[20px] font-normal text-[#2A2A2A]">
                  {String(data.timeStart % 12 || 12).padStart(2, "0")}:{minuteStart} <span className="text-[14px]">{data.timeStart < 12 ? "AM" : "PM"}</span>
                </p>
              </button>
              <span className="text-neutral-300 text-[16px]">›</span>
              <button
                type="button"
                onClick={() => { setTempMinute(minuteEnd); setTimeSheet("end"); }}
                className={`flex-1 rounded-[10px] border p-[10px] text-left ${timeSheet === "end" ? "border-[#CCFF00] bg-lime-light" : "border-[#E1E2E4]"}`}
              >
                <span className="text-[11px] text-[#737373]">종료</span>
                <p className="mt-1 font-[Noto_Sans_KR] text-[20px] font-normal text-[#2A2A2A]">
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
        )}

        {/* Step 2: 대분류 */}
        {step === 2 && (
          <>
            <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">{t("step2Title")}</h1>
            <p className="mt-[7px] text-[14px] font-medium text-[#737373]">{t("step2Subtitle")}</p>

            <div className="flex flex-wrap gap-[10px] mt-[26px]">
              {CATEGORIES.map((cat) => (
                <SelectChip
                  key={cat}
                  label={t(`categories.${cat}`)}
                  selected={data.categories.includes(cat)}
                  onToggle={() => toggleCategory(cat)}
                />
              ))}
            </div>

            {/* 안내 칩 */}
            <div className="flex-1" />
          </>
        )}

        {/* Step 3: 중분류 */}
        {step === 3 && (
          <Step3Content
            categories={data.categories}
            subCategories={data.subCategories}
            toggleSubCategory={toggleSubCategory}
            t={t}
          />
        )}

        {/* Step 4: 레벨 */}
        {step === 4 && (
          <>
            <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">{t("step4Title")}</h1>
            <p className="mt-[7px] text-[14px] font-medium text-[#737373]">{t("step4Subtitle")}</p>

            <div className="flex flex-col gap-[16px] mt-[30px]">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setData((d) => ({ ...d, level: lvl }))}
                  className={`w-full rounded-[16px] p-[12px] text-left transition-colors ${
                    data.level === lvl
                      ? "bg-[#F4FFD6] border-[1.5px] border-[#CCFF00]"
                      : "bg-white border-[1.5px] border-transparent shadow-[0px_2px_12px_0px_rgba(23,23,23,0.06)]"
                  }`}
                >
                  <span className="text-[15px] font-semibold tracking-[-0.3%] text-[#111111]">
                    {t(lvl)}
                  </span>
                  <span className="block mt-[6px] text-[12px] font-medium text-[#C4C4C4]">
                    {t(`${lvl}Desc`)}
                  </span>
                </button>
              ))}
            </div>
          </>
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
      <BottomSheet
        open={regionSheet}
        title="방문 지역 선택"
        onClose={() => setRegionSheet(false)}
        aboveFooter={
          <span className="rounded-full bg-[#F4FFD6] px-4 py-[10px] text-[12px] font-medium text-dark">
            최대 1개까지 선택할 수 있어요
          </span>
        }
        footer={
          <div className="flex items-center justify-between">
            <ResetButton onClick={() => setTempRegion("")} />
            <BigButton
              disabled={!tempRegion}
              onClick={() => { setData((d) => ({ ...d, region: tempRegion })); setRegionSheet(false); }}
              className="w-[164px] rounded-[16px]"
            >
              선택 완료
            </BigButton>
          </div>
        }
      >
        {/* 검색 — 37px 아래 */}
        <div className="mt-[5px] flex items-center h-[44px] rounded-[14px] bg-surface px-3">
          <input placeholder="어디로 방문하시나요?" className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-[#C4C4C4]" readOnly />
          <img src="/image/search-icon.svg" alt="검색" width={20} height={20} />
        </div>

        {/* 인기 여행지 */}
        <p className="mt-6 text-[13px] font-medium text-dark mb-3">인기 여행지</p>
        <div className="grid grid-cols-6 gap-2">
          {REGIONS.map((r) => (
            <SelectChip
              key={r}
              label={r}
              selected={tempRegion === r}
              onToggle={() => setTempRegion(r === tempRegion ? "" : r)}
            />
          ))}
        </div>

      </BottomSheet>

      {/* === 바텀시트: 날짜 선택 === */}
      <BottomSheet
        open={dateSheet}
        title="방문 날짜"
        onClose={() => setDateSheet(false)}
        footer={
          <div className="flex items-center justify-between">
            <ResetButton onClick={() => { setTempDateStart(null); setTempDateEnd(null); setDateSelecting("start"); }} />
            <BigButton
              disabled={!tempDateStart || !tempDateEnd}
              onClick={() => { setData((d) => ({ ...d, dateStart: tempDateStart, dateEnd: tempDateEnd })); setDateSheet(false); }}
              className="w-[164px] rounded-[16px]"
            >
              선택 완료
            </BigButton>
          </div>
        }
      >
        {/* 두 달 연속 캘린더 — 헤더에서 20px 아래 */}
        <div className="mt-[20px]">
        {[0, 1].map((offset) => {
          const m = (viewMonth.month + offset) % 12;
          const y = viewMonth.year + Math.floor((viewMonth.month + offset) / 12);
          const days = new Date(y, m + 1, 0).getDate();
          const first = new Date(y, m, 1).getDay();
          const toStr = (day: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isDis = (day: number) => new Date(y, m, day) < today;
          const isSel = (day: number) => { const d = toStr(day); return d === tempDateStart || d === tempDateEnd; };
          const isIn = (day: number) => { if (!tempDateStart || !tempDateEnd) return false; const d = toStr(day); return d > tempDateStart && d < tempDateEnd; };

          return (
            <div key={`${y}-${m}`} className={offset === 1 ? "mt-6" : ""}>
              {/* 월 헤더 — "일"과 동일 왼쪽 위치 */}
              <div className="flex items-center gap-2 mb-3 ml-[4px]">
                {offset === 0 && (
                  <button type="button" onClick={() => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })} className="text-[20px] text-neutral-400 leading-none -mt-[1px]">‹</button>
                )}
                <span className="text-[15px] font-semibold text-dark">{y}년 {m + 1}월</span>
                {offset === 0 && (
                  <button type="button" onClick={() => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })} className="text-[20px] text-neutral-400 leading-none -mt-[1px]">›</button>
                )}
              </div>

              {/* 요일 */}
              <div className="grid grid-cols-7 mb-1">
                {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                  <div key={d} className="flex justify-center">
                    <span className="h-[32px] w-[32px] flex items-center justify-center text-[12px] text-[#737373]">{d}</span>
                  </div>
                ))}
              </div>

              {/* 날짜 */}
              <div className="grid grid-cols-7 gap-y-[5px]">
                {Array.from({ length: first }).map((_, i) => <div key={`e-${i}`} />)}
                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1;
                  const disabled = isDis(day);
                  const selected = isSel(day);
                  const inRange = isIn(day);

                  return (
                    <div key={day} className="flex justify-center">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleDayClick2(toStr(day))}
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
        })}
        </div>
      </BottomSheet>

      {/* === 바텀시트: 시간 선택 (휠 다이얼) === */}
      <BottomSheet
        open={!!timeSheet}
        title={timeSheet === "start" ? "시작 시간" : "종료 시간"}
        onClose={() => {
          if (timeSheet === "start") setMinuteStart(tempMinute);
          else setMinuteEnd(tempMinute);
          setTimeSheet(null);
        }}
      >
        <div className="relative flex justify-center gap-6 py-4">
          {/* 선택 하이라이트 밴드 */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[40px] bg-[#F4FFD6] rounded-lg pointer-events-none" />

          {/* 시 */}
          <div className="relative w-[60px]">
            <WheelPicker
              items={Array.from({ length: 12 }, (_, i) => String(i + 1))}
              value={String(((timeSheet === "start" ? data.timeStart : data.timeEnd) % 12) || 12)}
              onChange={(val) => {
                const h = Number(val);
                const isPM = (timeSheet === "start" ? data.timeStart : data.timeEnd) >= 12;
                const newH = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
                if (timeSheet === "start") setData((d) => ({ ...d, timeStart: newH }));
                else setData((d) => ({ ...d, timeEnd: newH }));
              }}
            />
          </div>

          {/* 분 */}
          <div className="relative w-[60px]">
            <WheelPicker
              items={Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))}
              value={tempMinute}
              onChange={(val) => setTempMinute(val)}
            />
          </div>

          {/* AM/PM */}
          <div className="relative w-[60px]">
            <WheelPicker
              items={["AM", "PM"]}
              value={(timeSheet === "start" ? data.timeStart : data.timeEnd) < 12 ? "AM" : "PM"}
              onChange={(val) => {
                const current = timeSheet === "start" ? data.timeStart : data.timeEnd;
                const hour12 = current % 12;
                const newH = val === "PM" ? hour12 + 12 : hour12;
                if (timeSheet === "start") setData((d) => ({ ...d, timeStart: newH }));
                else setData((d) => ({ ...d, timeEnd: newH }));
              }}
            />
          </div>
        </div>
      </BottomSheet>
    </div>
    </PageTransition>
  );
}

// Step 3 — 접기/펼치기 카드
function Step3Content({
  categories,
  subCategories,
  toggleSubCategory,
  t,
}: {
  categories: string[];
  subCategories: string[];
  toggleSubCategory: (sub: string) => void;
  t: (key: string) => string;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (cat: string) => {
    setCollapsed((c) => ({ ...c, [cat]: !c[cat] }));
  };

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">{t("step3Title")}</h1>
      <p className="mt-[7px] text-[14px] font-medium text-[#737373]">{t("step3Subtitle")}</p>

      <div className="flex flex-col gap-[12px] mt-[30px]">
        {categories.map((cat) => (
          <div
            key={cat}
            className="rounded-[12px] bg-white px-[12px] py-[10px] shadow-[0px_2px_12px_0px_rgba(23,23,23,0.06)]"
          >
            <button
              type="button"
              onClick={() => toggle(cat)}
              className="flex w-full items-center justify-between"
            >
              <span className="text-[13px] font-semibold text-dark">{t(`categories.${cat}`)}</span>
              <span className={`text-[12px] text-[#C4C4C4] transition-transform ${collapsed[cat] ? "rotate-180" : ""}`}>▼</span>
            </button>
            {!collapsed[cat] && (
              <div className="flex flex-wrap gap-[8px] mt-[8px]">
                {(SUB_CATEGORIES[cat] ?? []).map((sub) => (
                  <SelectChip
                    key={sub}
                    label={sub}
                    selected={subCategories.includes(sub)}
                    onToggle={() => toggleSubCategory(sub)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
