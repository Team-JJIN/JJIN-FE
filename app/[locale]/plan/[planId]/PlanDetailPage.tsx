/**
 * @component PlanDetailPage
 * 일정 상세(S1 읽기 · S2 편집 · S3 선택) 메인 화면. 일차 전환은 크로스페이드(key=activeDay),
 * 편집 전환은 크로스페이드가 아니라 PlaceList가 마운트를 유지한 채 카드가 height 트윈으로 늘어난다.
 * S3 선택은 카드 자체 탭이 주 수단(같은 카드 재탭 시 해제)이고, CourseDropdown은 같은
 * selectedOrder를 비추는 보조 컨트롤이다.
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { fadeSwap, sectionEnter } from "@/app/_components/motion/tokens";
import { getApiErrorMessage } from "@/app/_api/client";
import { PlanSaveError, toPlanApiLocale } from "@/app/_api/plans";
import { buildKakaoRouteUrl } from "../_lib/geo";
import { usePlanDetail, useSavePlanDay } from "../_hooks/usePlanQueries";
import { selectIsEditing, usePlanEditStore } from "../_store/usePlanEditStore";
import PlanHeader from "./_components/PlanHeader";
import DayChips from "./_components/DayChips";
import PlanMap from "./_components/PlanMap";
import CourseHeader from "./_components/CourseHeader";
import PlaceList from "./_components/PlaceList";
import KakaoMapsScript from "./_components/KakaoMapsScript";
import AiCourseButton from "./_components/AiCourseButton";
import AiCourseSheet from "./_components/AiCourseSheet";
import type { PlanPlace } from "../_types";

const EMPTY: PlanPlace[] = [];

export default function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("plan");

  const saveLock = useRef(false);
  const [activeDay, setActiveDay] = useState(() => {
    const s = usePlanEditStore.getState();
    if (
      s.recoveryRequired &&
      s.recoveryPlanId === planId &&
      s.recoveryDayIndex !== null
    )
      return s.recoveryDayIndex;
    return s.mode === "edit" && s.planId === planId ? s.dayIndex : 0;
  });
  const { data, isPending, isError, refetch } = usePlanDetail(
    planId,
    activeDay,
  );
  const { mutateAsync } = useSavePlanDay();

  const draft = usePlanEditStore((s) => s.draft);
  const original = usePlanEditStore((s) => s.original);
  const setSaving = usePlanEditStore((s) => s.setSaving);
  const saving = usePlanEditStore((s) => s.saving);
  const requireRecovery = usePlanEditStore((s) => s.requireRecovery);
  const clearRecovery = usePlanEditStore((s) => s.clearRecovery);
  const recovering = usePlanEditStore(
    (s) =>
      s.recoveryRequired &&
      s.recoveryPlanId === planId &&
      s.recoveryDayIndex === activeDay,
  );
  const beginEdit = usePlanEditStore((s) => s.beginEdit);
  const removePlace = usePlanEditStore((s) => s.removePlace);
  const reorder = usePlanEditStore((s) => s.reorder);
  const discard = usePlanEditStore((s) => s.discard);

  // mode/dayIndex는 초기 activeDay를 한 번만 시딩하는 데 쓰이므로 구독 대신
  // getState()로 한 번만 읽는다(구독하면 스토어가 바뀔 때마다 불필요한 리렌더가 생긴다).
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [aiSheetOpen, setAiSheetOpen] = useState(false);

  const isEditing = usePlanEditStore(selectIsEditing(planId, activeDay));
  const day = data?.days.find((d) => d.dayIndex === activeDay);
  const places = isEditing ? draft : (day?.places ?? EMPTY);

  const handleSelectDay = useCallback(
    (i: number) => {
      if (isEditing || saveLock.current) return;
      setActiveDay(i);
      setSelectedOrder(null);
      setSaveError(null);
    },
    [isEditing],
  );

  const handleEdit = useCallback(() => {
    if (!day || saveLock.current || recovering) return;
    beginEdit(planId, activeDay, day.places);
    setSelectedOrder(null);
    setSaveError(null);
  }, [beginEdit, planId, activeDay, day, recovering]);

  const handleEditDone = useCallback(async () => {
    if (saveLock.current) return;
    saveLock.current = true;
    setSaving(true);
    try {
      await mutateAsync({
        planId,
        dayIndex: activeDay,
        locale: toPlanApiLocale(locale),
        original,
        draft,
      });
      setSaving(false);
      discard();
      setSaveError(null);
    } catch (err) {
      // 쓰기가 하나라도 시작됐으면 draft로 재시도하지 않고 서버 코스를 다시 읽는다.
      const partial = err instanceof PlanSaveError && err.writesStarted;
      if (partial) {
        requireRecovery(planId, activeDay);
        const result = await refetch();
        if (!result.isError) clearRecovery(planId, activeDay);
        setSaveError(
          result.isError ? t("recoveryLoadError") : t("partialSaveError"),
        );
      } else {
        setSaveError(
          getApiErrorMessage(
            err instanceof PlanSaveError ? err.causeError : err,
            t("saveError"),
          ),
        );
      }
    } finally {
      setSaving(false);
      saveLock.current = false;
    }
  }, [
    mutateAsync,
    planId,
    activeDay,
    locale,
    original,
    draft,
    setSaving,
    discard,
    requireRecovery,
    clearRecovery,
    refetch,
    t,
  ]);

  const handleReorder = useCallback(
    (next: PlanPlace[]) => {
      if (!saveLock.current) reorder(next);
    },
    [reorder],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!saveLock.current) removePlace(id);
    },
    [removePlace],
  );

  // 카드 탭으로 selected 토글(같은 카드 재탭 시 해제). CourseDropdown은 같은 selectedOrder
  // 상태를 비추는 보조 컨트롤로 남는다. 편집 중에는 카드가 탭 불가(variant="edit")이므로
  // 지도 마커도 같은 규칙을 따른다 — 편집 중 선택이 남아 있으면 삭제·재정렬의 order 재부여로
  // selectedOrder가 엉뚱한 장소를 가리켜 지도가 튄다.
  const handleToggleSelect = useCallback(
    (order: number) => {
      if (isEditing || saveLock.current) return;
      setSelectedOrder((prev) => (prev === order ? null : order));
    },
    [isEditing],
  );

  // 브리프의 핸들러 목록에는 명시돼 있지 않지만, PlaceCard(selected)의 길찾기 버튼이
  // onDirections를 요구하므로 P1이 제공한 buildKakaoRouteUrl로 카카오맵 길찾기 링크를 새 탭에 연다.
  const handleDirections = useCallback((place: PlanPlace) => {
    window.open(
      buildKakaoRouteUrl(place.name, place.lat, place.lng),
      "_blank",
      "noopener,noreferrer",
    );
  }, []);

  const handleAddPlace = useCallback(() => {
    if (saveLock.current) return;
    router.push(`/${locale}/plan/${planId}/search?day=${activeDay}`);
  }, [router, locale, planId, activeDay]);

  return (
    <div className="flex h-dvh flex-col">
      <PlanHeader title={data?.name ?? ""} disabled={saving} />
      <KakaoMapsScript />
      <AnimatePresence mode="wait" initial={false}>
        {isError || recovering ? (
          <motion.div
            key="error"
            {...fadeSwap}
            className="flex flex-1 flex-col items-center justify-center gap-3"
          >
            <p className="text-[13px] font-medium text-subtext">
              {saveError ??
                (recovering ? t("recoveryLoadError") : t("loadError"))}
            </p>
            <button
              type="button"
              onClick={async () => {
                const result = await refetch();
                if (!result.isError) {
                  clearRecovery(planId, activeDay);
                  setSaveError(null);
                }
              }}
              className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.96]"
            >
              {t("retry")}
            </button>
          </motion.div>
        ) : isPending || !data ? (
          <motion.div key="loading" {...fadeSwap} className="flex-1" />
        ) : (
          <motion.div
            key="ready"
            {...fadeSwap}
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <DayChips
              dayCount={data.dayCount}
              startDate={data.startDate}
              days={data.days}
              activeDay={activeDay}
              onSelect={handleSelectDay}
              disabled={isEditing || saving}
            />
            {/* 여백은 스크롤 컨테이너 안쪽에 둔다 — 바깥에 두면 드래그로 1.02배 커진 행의
                왼쪽 끝(번호 원)과 첫 행의 위쪽 테두리·그림자가 overflow에 잘린다.
                헤더-목록 간격 14px = gap 10 + 컨테이너 pt 4. */}
            <div className="flex min-h-0 flex-1 flex-col gap-[21px]">
              <div className="shrink-0 px-4">
                <PlanMap
                  places={places}
                  selectedOrder={selectedOrder}
                  onSelectOrder={setSelectedOrder}
                  onToggleOrder={handleToggleSelect}
                  showDropdown={!isEditing && places.length > 0}
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-[10px]">
                <motion.div {...sectionEnter(3)} className="shrink-0 px-4">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={`day-${activeDay}`} {...fadeSwap}>
                      <CourseHeader
                        count={places.length}
                        isEditing={isEditing}
                        saving={saving}
                        onEdit={handleEdit}
                        onEditDone={handleEditDone}
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
                <motion.div
                  {...sectionEnter(4, true)}
                  layoutScroll
                  className="min-h-0 flex-1 overflow-y-auto px-4 pb-[82px] pt-1 scroll-pt-1"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={`day-${activeDay}`} {...fadeSwap}>
                      <PlaceList
                        places={places}
                        isEditing={isEditing}
                        saving={saving}
                        selectedOrder={selectedOrder}
                        onReorder={handleReorder}
                        onDelete={handleDelete}
                        onDirections={handleDirections}
                        onToggleSelect={handleToggleSelect}
                        onAddPlace={handleAddPlace}
                      />
                      {saveError && (
                        <p
                          role="alert"
                          className="pt-3 text-[12px] font-medium leading-[1.6] text-error"
                        >
                          {saveError}
                        </p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI 코스 생성 버튼 (읽기 상태에서만) + 추천 바텀시트 */}
      {!isEditing && !isError && !recovering && data && (
        <AiCourseButton onClick={() => setAiSheetOpen(true)} />
      )}
      <AiCourseSheet
        open={aiSheetOpen}
        onClose={() => setAiSheetOpen(false)}
        onConfirm={() => {
          setAiSheetOpen(false);
          router.push(`/${locale}/plan/${planId}/course`);
        }}
      />
    </div>
  );
}
