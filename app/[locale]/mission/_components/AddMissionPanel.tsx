/**
 * @component AddMissionPanel
 * 미션 추가 바텀시트의 콘텐츠. 요약 카드 + 내 일정 리스트 + 취소/추가하기 푸터로 구성되며,
 * 한 미션을 여러 일정에 동시에 담을 수 있다. 이미 담긴 일정은 체크된 상태로 시작하고,
 * 행을 탭할 때마다 담기/해제가 토글된다. '추가하기'를 눌러야 선택 결과가 서버에 일괄 반영되고,
 * '취소'를 누르면 로컬에서 토글한 내용은 버려진다.
 */
"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import { CheckIcon, SparkleIcon } from "@/app/_components/icons";
import DifficultyStars from "./DifficultyStars";
import { useMyPlans, useSetMissionPlans } from "../_hooks/useMissionQueries";
import type { Mission, MyPlan } from "@/app/_api/missions";

// ISO(YYYY-MM-DD) 날짜 문자열을 로컬 타임존 기준으로 파싱한다.
// new Date(iso)는 UTC 자정으로 해석되어 음수 UTC 오프셋 지역에서 하루 밀리는 문제가 있어 직접 분해한다.
// 형식이 깨진 값은 null — Invalid Date를 Intl.DateTimeFormat에 넘기면 RangeError로 패널 전체가 죽는다.
function parseIsoDate(iso: string): Date | null {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

// 순서 무관하게 두 일정 id 목록이 같은 집합인지 비교한다 (추가하기 버튼의 dirty 여부 판단용).
function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

export interface AddMissionPanelProps {
  mission: Mission; // 추가 대상 미션
  onDone: () => void; // 추가 성공 후 호출 (셸이 시트를 닫음)
  onCancel: () => void; // 취소 버튼
}

export default function AddMissionPanel({
  mission,
  onDone,
  onCancel,
}: AddMissionPanelProps) {
  const t = useTranslations("mission");
  const locale = useLocale();

  // 초기값은 이미 담긴 일정 목록. 이후 mission prop이 바뀌어도 여기서 동기화하지 않는다 —
  // 셸(MissionSheet)이 오픈마다 key를 바꿔 이 패널을 새로 마운트하므로 초기값이 곧 baseline이다.
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>(
    () => mission.addedPlanIds,
  );

  const { data: myPlans } = useMyPlans(true);
  const plans = myPlans ?? [];

  const setMissionPlansMutation = useSetMissionPlans();

  const handleTogglePlan = useCallback((planId: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId],
    );
  }, []);

  const isDirty = !sameSet(selectedPlanIds, mission.addedPlanIds);

  const handleConfirm = useCallback(() => {
    setMissionPlansMutation.mutate(
      { missionId: mission.id, planIds: selectedPlanIds },
      { onSuccess: onDone },
    );
  }, [mission.id, selectedPlanIds, setMissionPlansMutation, onDone]);

  // Intl.DateTimeFormat 생성은 비싼 편이라 로케일 단위로 한 번만 만든다 (행마다 재생성 금지)
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }),
    [locale],
  );

  const formatPlanDate = useCallback(
    (plan: MyPlan) => {
      const format = (iso: string) => {
        const date = parseIsoDate(iso);
        return date ? dateFormatter.format(date) : iso;
      };
      return `${format(plan.dateStart)} ~ ${format(plan.dateEnd)}`;
    },
    [dateFormatter],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-[20px] pb-4">
        {/* 추가할 미션 요약 카드 (읽기 전용) */}
        <div className="flex items-center gap-[24px] rounded-[16px] bg-white px-[21px] py-[11px] shadow-[0px_5px_9px_0px_rgba(23,23,23,0.08)]">
          {mission.imageUrl ? (
            <img
              src={mission.imageUrl}
              alt={mission.title}
              className="size-[35px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-[35px] shrink-0 items-center justify-center rounded-full bg-lime-pale">
              <SparkleIcon size={20} className="text-lime-vivid" />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-[2px]">
            <h3 className="line-clamp-2 text-[15px] font-semibold tracking-[-0.045px] text-ink">
              {mission.title}
            </h3>
            <DifficultyStars difficulty={mission.difficulty} />
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
            const selected = selectedPlanIds.includes(plan.id);
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => handleTogglePlan(plan.id)}
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
                    className={selected ? "text-dark" : "text-muted"}
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
      </div>

      <div className="px-[20px] py-[29px] bg-white rounded-t-[16px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="flex gap-[16px]">
          <button
            type="button"
            onClick={onCancel}
            className="h-[48px] flex-1 rounded-[16px] bg-surface text-[15px] font-semibold text-dark transition motion-safe:active:scale-[0.98]"
          >
            {t("add.cancel")}
          </button>
          <div className="flex-1">
            <BigButton
              fullWidth
              disabled={!isDirty || setMissionPlansMutation.isPending}
              isLoading={setMissionPlansMutation.isPending}
              onClick={handleConfirm}
            >
              {t("add.confirm")}
            </BigButton>
          </div>
        </div>
      </div>
    </div>
  );
}
