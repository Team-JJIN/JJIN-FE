/**
 * @component PlanSearchPage
 * 장소 검색 직접 진입/새로고침 대응 페이지 껍데기. 스토어가 idle이거나 다른 planId를
 * 편집 중이면 일정 상세 도착 시 1회만 beginEdit으로 편집 모드를 재구성한다
 * (이미 이 planId로 edit 중이면 그대로 둔다 — 인터셉트 패널 등 다른 경로에서 이미 시작한 편집을 덮어쓰지 않기 위함).
 */
"use client";

import { useCallback, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import TopBarClose from "@/app/_components/ui/TopBarClose";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { usePlanDetail } from "../../_hooks/usePlanQueries";
import { usePlanEditStore } from "../../_store/usePlanEditStore";
import PlaceSearchPanel from "../../_components/PlaceSearchPanel";

export default function PlanSearchPage() {
  const { planId } = useParams<{ planId: string }>();
  const searchParams = useSearchParams();
  const dayIndex = Number.parseInt(searchParams.get("day") ?? "0", 10) || 0;

  const locale = useLocale();
  const t = useTranslations("plan");
  const router = useRouter();

  const { data, isError, refetch } = usePlanDetail(planId, dayIndex);
  const mode = usePlanEditStore((s) => s.mode);
  const storePlanId = usePlanEditStore((s) => s.planId);
  const storeDayIndex = usePlanEditStore((s) => s.dayIndex);
  const beginEdit = usePlanEditStore((s) => s.beginEdit);
  const recovering = usePlanEditStore(
    (s) =>
      s.recoveryRequired &&
      s.recoveryPlanId === planId &&
      s.recoveryDayIndex === dayIndex,
  );
  const clearRecovery = usePlanEditStore((s) => s.clearRecovery);

  useEffect(() => {
    if (!recovering) return;
    void refetch().then((result) => {
      if (!result.isError) clearRecovery(planId, dayIndex);
    });
  }, [recovering, refetch, clearRecovery, planId, dayIndex]);

  useEffect(() => {
    if (!data || isError || recovering) return;
    // 같은 planId라도 다른 일차를 편집 중이면(예: day=0 편집 중 ?day=1로 직접 진입) beginEdit을
    // 다시 돌려 draft를 해당 일차로 재구성한다(review-1 m8).
    if (mode === "edit" && storePlanId === planId && storeDayIndex === dayIndex)
      return;
    const places = data.days.find((d) => d.dayIndex === dayIndex)?.places ?? [];
    beginEdit(planId, dayIndex, places);
  }, [
    data,
    isError,
    recovering,
    mode,
    storePlanId,
    storeDayIndex,
    planId,
    dayIndex,
    beginEdit,
  ]);

  // 이 전체 페이지는 하드 로드(딥링크·새로고침)에서만 렌더되므로 이전 히스토리 항목은 항상 다른
  // 문서다 — back()은 풀 리로드가 되어 스토어 draft가 사라진다. 닫기는 소프트 replace로 상세에 진입해
  // 편집 draft(추가 장소·일차)를 보존한다(verify-1 항목 15).
  const handleClose = useCallback(() => {
    router.replace(`/${locale}/plan/${planId}`);
  }, [router, locale, planId]);

  return (
    <div className="flex h-dvh flex-col bg-white">
      {/* PlanHeader.tsx(P2)와 동일한 헤더(px-4 py-3 + titleClassName 19px) — 상세 헤더와 전환 시 크기가
          튀지 않도록 두 화면이 같은 값을 쓴다(review-1 M3 수정). motion은 PageTransition이 담당하므로
          여기서 추가하지 않는다. */}
      <div className="px-4 py-3">
        <TopBarClose
          title={t("search.title")}
          onClose={handleClose}
          closeLabel={t("close")}
          titleClassName="text-[19px] font-semibold leading-[1.4] text-[#171717]"
        />
      </div>
      {isError || recovering ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <p className="text-[13px] text-subtext">{t("loadError")}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-dark px-4 py-2 text-[12px] text-white"
          >
            {t("retry")}
          </button>
        </div>
      ) : data ? (
        <PlaceSearchPanel />
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
