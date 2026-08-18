/**
 * @component AddMissionOverlay
 * 미션 추가 오버레이(바텀시트). useAddMissionStore의 targetMission으로 열림 상태를 제어하며,
 * 내 일정 목록에서 일정 하나를 선택해 미션을 추가한다.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import BigButton from "@/app/_components/ui/BigButton";
import { CheckIcon, SparkleIcon } from "@/app/_components/icons";
import DifficultyStars from "./DifficultyStars";
import { useAddMissionStore } from "../_store/useAddMissionStore";
import { useMyPlans, useAddMissionToPlan } from "../_hooks/useMissionQueries";
import type { Mission, MyPlan } from "@/app/_api/missions";

// ISO(YYYY-MM-DD) 날짜 문자열을 로컬 타임존 기준으로 파싱한다.
// new Date(iso)는 UTC 자정으로 해석되어 음수 UTC 오프셋 지역에서 하루 밀리는 문제가 있어 직접 분해한다.
function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function AddMissionOverlay() {
  const t = useTranslations("mission");
  const locale = useLocale();

  const targetMission = useAddMissionStore((s) => s.targetMission);
  const closeOverlay = useAddMissionStore((s) => s.close);
  const open = targetMission !== null;

  // exit 슬라이드 애니메이션 동안에도 콘텐츠가 유지되도록 마지막 미션 정보를 별도로 보관
  const [displayMission, setDisplayMission] = useState<Mission | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (targetMission) {
      setDisplayMission(targetMission);
      setSelectedPlanId(null);
    }
  }, [targetMission]);

  const { data: myPlans } = useMyPlans(open);
  const plans = myPlans ?? [];

  const addMissionMutation = useAddMissionToPlan();

  const handleSelectPlan = useCallback((planId: string) => {
    setSelectedPlanId(planId);
  }, []);

  const handleClose = useCallback(() => {
    closeOverlay();
  }, [closeOverlay]);

  const handleConfirm = useCallback(() => {
    if (!displayMission || !selectedPlanId) return;
    addMissionMutation.mutate(
      { missionId: displayMission.id, planId: selectedPlanId },
      { onSuccess: () => closeOverlay() },
    );
  }, [displayMission, selectedPlanId, addMissionMutation, closeOverlay]);

  const formatPlanDate = useCallback(
    (plan: MyPlan) => {
      const formatter = new Intl.DateTimeFormat(locale, {
        month: "long",
        day: "numeric",
      });
      return `${formatter.format(parseIsoDate(plan.dateStart))} ~ ${formatter.format(parseIsoDate(plan.dateEnd))}`;
    },
    [locale],
  );

  if (!displayMission) return null;

  return (
    <BottomSheet
      open={open}
      title={t("add.title")}
      onClose={handleClose}
      closeLabel={t("close")}
      animated
      footer={
        <div className="flex gap-[16px]">
          <button
            type="button"
            onClick={handleClose}
            className="h-[48px] flex-1 rounded-[16px] bg-surface text-[15px] font-semibold text-dark transition motion-safe:active:scale-[0.98]"
          >
            {t("add.cancel")}
          </button>
          <div className="flex-1">
            <BigButton
              fullWidth
              disabled={!selectedPlanId || addMissionMutation.isPending}
              isLoading={addMissionMutation.isPending}
              onClick={handleConfirm}
            >
              {t("add.confirm")}
            </BigButton>
          </div>
        </div>
      }
    >
      {/* 추가할 미션 요약 카드 (읽기 전용) */}
      <div className="flex items-center gap-[24px] rounded-[16px] bg-white px-[21px] py-[11px] shadow-[0px_5px_9px_0px_rgba(23,23,23,0.08)]">
        {displayMission.imageUrl ? (
          <img
            src={displayMission.imageUrl}
            alt={displayMission.title}
            className="size-[35px] shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-[35px] shrink-0 items-center justify-center rounded-full bg-lime-pale">
            <SparkleIcon size={20} className="text-lime-vivid" />
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-[2px]">
          <h3 className="line-clamp-2 text-[15px] font-semibold tracking-[-0.045px] text-ink">
            {displayMission.title}
          </h3>
          <DifficultyStars difficulty={displayMission.difficulty} />
        </div>
      </div>

      {/* 내 일정 리스트 */}
      <div className="mt-[27px] flex flex-col gap-[10px]">
        <div className="flex items-center justify-between px-[16px] text-[12px] font-medium">
          <span className="text-ink">{t("add.myPlans")}</span>
          <span className="text-muted">
            {t("add.planCount", { count: plans.length })}
          </span>
        </div>

        {plans.map((plan) => {
          const selected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => handleSelectPlan(plan.id)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-[16px] py-[13px] text-left transition motion-safe:active:scale-[0.98] ${
                selected
                  ? "border-lime-vivid bg-lime-pale"
                  : "border-line bg-white"
              }`}
            >
              <span
                className={`flex size-[24px] shrink-0 items-center justify-center rounded-full ${
                  selected ? "bg-lime-vivid" : "bg-surface"
                }`}
              >
                <CheckIcon
                  size={14}
                  className={selected ? "text-white" : "text-muted"}
                />
              </span>
              <div className="flex flex-col gap-[2px]">
                <span className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
                  {plan.title}
                </span>
                <span className="text-[12px] font-medium text-subtext">
                  {formatPlanDate(plan)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
