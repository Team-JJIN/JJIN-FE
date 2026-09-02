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
import {
  useMissionPlanLikes,
  useUpdateMissionPlans,
} from "../_hooks/useMissionQueries";
import type { MissionPlanLike } from "@/app/_api/missions";
import type { MissionPreview } from "../_store/useMissionSheetStore";

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
  missionId: string; // 추가 대상 미션 id
  // 요약 카드(이미지/제목/난이도)용 최소 정보. 상세 응답을 다시 fetch하지 않고
  // 시트가 이미 들고 있는 preview를 그대로 받는다 (useMissionSheetStore 참고)
  preview: MissionPreview;
  active: boolean; // 시트가 열려 있는 동안만 true. 닫힘 exit 모션 중 planLikes invalidate가 refetch를 유발하지 않게 막는다
  onDone: () => void; // 추가 성공 후 호출 (셸이 시트를 닫음)
  onCancel: () => void; // 취소 버튼
}

export default function AddMissionPanel({
  missionId,
  preview,
  active,
  onDone,
  onCancel,
}: AddMissionPanelProps) {
  const t = useTranslations("mission");
  const locale = useLocale();

  const { data, isPending, isError, refetch } = useMissionPlanLikes(
    missionId,
    active,
  );
  const plans = useMemo<MissionPlanLike[]>(() => data?.plans ?? [], [data]);
  const likedIds = useMemo(
    () => plans.filter((p) => p.isLiked).map((p) => p.planId),
    [plans],
  );

  // draft는 사용자가 한 번이라도 토글하기 전엔 null이고, 그동안은 likedIds를 그대로 selected로
  // 쓴다. 첫 토글이 일어나는 순간 그 시점의 likedIds를 draft.baseline으로 얼려 넣는다 —
  // 이후 focus refetch 등으로 서버 응답(찜한 일정 목록)이 바뀌어도 baseline은 고정되므로,
  // handleConfirm의 diff(addPlanIds/removePlanIds)는 항상 "사용자가 실제로 건드린 일정"만
  // 반영한다. baseline을 얼리지 않으면 refetch로 달라진 최신 likedIds와 selected를 비교하게
  // 되어, 사용자가 손대지 않은 일정까지 해제 대상으로 잘못 계산되는 버그가 생긴다.
  // useEffect로 동기화하지 않는 이유: 셸(MissionSheet)이 오픈마다 key를 바꿔 이 패널을 새로
  // 마운트하므로, 마운트 시점의 null → 첫 데이터 도착이 곧 자연스러운 초기화다.
  const [draft, setDraft] = useState<{
    baseline: string[];
    selected: string[];
  } | null>(null);
  const selected = draft?.selected ?? likedIds;

  const updateMissionPlansMutation = useUpdateMissionPlans();

  const handleTogglePlan = useCallback(
    (planId: string) => {
      setDraft((prev) => {
        const base = prev ?? { baseline: likedIds, selected: likedIds };
        const nextSelected = base.selected.includes(planId)
          ? base.selected.filter((id) => id !== planId)
          : [...base.selected, planId];
        return { baseline: base.baseline, selected: nextSelected };
      });
    },
    [likedIds],
  );

  const isDirty = draft !== null && !sameSet(draft.selected, draft.baseline);

  const handleConfirm = useCallback(async () => {
    if (!draft) return;
    const addPlanIds = draft.selected.filter(
      (id) => !draft.baseline.includes(id),
    );
    const removePlanIds = draft.baseline.filter(
      (id) => !draft.selected.includes(id),
    );
    try {
      await updateMissionPlansMutation.mutateAsync({
        missionId,
        addPlanIds,
        removePlanIds,
        nextIsAdded: draft.selected.length > 0,
      });
      onDone();
    } catch {
      // 오류는 isError로 렌더한다.
    }
  }, [missionId, draft, updateMissionPlansMutation, onDone]);

  // Intl.DateTimeFormat 생성은 비싼 편이라 로케일 단위로 한 번만 만든다 (행마다 재생성 금지)
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", day: "numeric" }),
    [locale],
  );

  const formatPlanDate = useCallback(
    (plan: MissionPlanLike) => {
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
          {preview.imageUrl ? (
            <img
              src={preview.imageUrl}
              alt={preview.title}
              className="size-[35px] shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-[35px] shrink-0 items-center justify-center rounded-full bg-lime-pale">
              <SparkleIcon size={20} className="text-lime-vivid" />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-[2px]">
            <h3 className="line-clamp-2 text-[15px] font-semibold tracking-[-0.045px] text-ink">
              {preview.title}
            </h3>
            <DifficultyStars difficulty={preview.difficulty} />
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

          {isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <p className="text-[13px] font-medium text-subtext">
                {t("sheet.loadError")}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.97]"
              >
                {t("retry")}
              </button>
            </div>
          ) : isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex w-full items-center gap-3 rounded-[14px] border-[1.5px] border-line bg-white px-[16px] py-[13px]"
              >
                <span className="size-[24px] shrink-0 animate-pulse rounded-full bg-surface" />
                <div className="flex flex-1 flex-col gap-[6px]">
                  <span className="h-[15px] w-2/3 animate-pulse rounded-full bg-surface" />
                  <span className="h-[12px] w-1/3 animate-pulse rounded-full bg-surface" />
                </div>
              </div>
            ))
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-center text-[13px] font-medium text-subtext">
                {t("add.noPlans")}
              </p>
            </div>
          ) : (
            plans.map((plan) => {
              const isSelected = selected.includes(plan.planId);
              return (
                <button
                  key={plan.planId}
                  type="button"
                  onClick={() => handleTogglePlan(plan.planId)}
                  aria-pressed={isSelected}
                  className={`flex w-full items-center gap-3 rounded-[14px] border-[1.5px] px-[16px] py-[13px] text-left transition motion-safe:active:scale-[0.98] ${
                    isSelected
                      ? "border-lime-vivid bg-lime-pale"
                      : "border-line bg-white"
                  }`}
                >
                  <span
                    className={`flex size-[24px] shrink-0 items-center justify-center rounded-full ${
                      isSelected ? "bg-lime-vivid" : "bg-surface"
                    }`}
                  >
                    <CheckIcon
                      size={14}
                      className={isSelected ? "text-dark" : "text-muted"}
                    />
                  </span>
                  <div className="flex flex-col gap-[2px]">
                    <span className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
                      {plan.planName}
                    </span>
                    <span className="text-[12px] font-medium text-subtext">
                      {formatPlanDate(plan)}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="px-[20px] py-[29px] bg-white rounded-t-[16px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
        {updateMissionPlansMutation.isError ? (
          <p role="alert" className="mb-3 text-[13px] font-medium text-subtext">
            {t("add.saveError")}
          </p>
        ) : null}
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
              disabled={!isDirty || updateMissionPlansMutation.isPending}
              isLoading={updateMissionPlansMutation.isPending}
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
