/**
 * @component HomePage
 * 홈(일정 목록) 페이지. 상단 "일정" 제목 + 추가 버튼, 일정 카드 목록.
 * 목록이 비어 있으면 빈 상태(JJ 로고 + 안내 문구)를 보여준다.
 *
 * NOTE: 일정 목록 조회 API가 아직 없어 현재는 빈 배열로 둔다(빈 상태 노출).
 *   조회 API 스펙 확정 시 plans를 서버 데이터로 교체한다.
 */
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { PlusIcon } from "@/app/_components/icons";

/** 일정 카드에 필요한 최소 데이터 (조회 API 확정 시 교체) */
type TravelPlanCard = {
  id: number;
  name: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;
  transportLabel: string;
  preferenceLabels: string[];
  level: "LIGHT" | "NORMAL" | "DEEP";
  nights: number;
  days: number;
};

const PLANS: TravelPlanCard[] = [];

// "2026-03-08" -> "26.03.08"
function formatDot(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 헤더: 제목 + 추가 버튼 */}
      <div className="flex items-center justify-between pt-[32px] pb-4">
        <h1 className="text-[19px] font-semibold tracking-[-0.095px] text-dark">{t("title")}</h1>
        {/* TODO: 일정 생성 플로우 연결 전까지 비활성화 */}
        <button
          type="button"
          disabled
          aria-label={t("addPlan")}
          className="cursor-default"
        >
          <PlusIcon />
        </button>
      </div>

      {PLANS.length === 0 ? (
        /* 빈 상태: JJ 로고 + 안내 문구 (화면 중앙) */
        <div className="flex flex-1 flex-col items-center justify-center pb-[80px]">
          <Image src="/image/JJ.png" alt="" width={111} height={111} className="h-[111px] w-[111px] object-contain" />
          <p className="mt-[9px] text-[17px] font-semibold text-ink">{t("emptyTitle")}</p>
          <p className="mt-[9px] whitespace-pre-line text-center text-[14px] font-medium text-subtext">
            {t("emptyDescription")}
          </p>
        </div>
      ) : (
        /* 일정 카드 목록 */
        <div className="-mx-[20px] flex-1 overflow-y-auto px-[20px] pb-[96px]">
          <div className="flex flex-col gap-[16px]">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} nightsLabel={t("nights", { nights: plan.nights, days: plan.days })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, nightsLabel }: { plan: TravelPlanCard; nightsLabel: string }) {
  return (
    <div className="rounded-[16px] bg-white p-[20px] shadow-[0px_2px_12px_0px_rgba(23,23,23,0.06)]">
      <div className="flex items-start justify-between">
        <h2 className="text-[16px] font-bold text-dark">{plan.name}</h2>
        <button type="button" aria-label="delete" className="text-neutral-300">🗑</button>
      </div>
      <p className="mt-[10px] text-[13px] font-medium text-subtext">
        {formatDot(plan.startDate)} – {formatDot(plan.endDate)}
      </p>
      <p className="mt-[4px] text-[13px] font-medium text-subtext">{plan.transportLabel}</p>
      <p className="mt-[4px] text-[13px] font-medium text-subtext">{plan.preferenceLabels.join(" · ")}</p>

      <div className="mt-[14px] flex items-center justify-between">
        <span className="rounded-full border-[1.5px] border-lime-vivid bg-lime-pale px-3 py-[5px] text-[12px] font-semibold text-dark">
          {plan.level}
        </span>
        <span className="text-[12px] font-medium text-subtext">{nightsLabel}</span>
      </div>
    </div>
  );
}
