/**
 * @component PlanDetailPage
 * 일정 상세(S1 읽기 · S2 편집 · S3 선택) 메인 화면. 일차 전환은 크로스페이드(key=activeDay),
 * 편집 전환은 크로스페이드가 아니라 PlaceList가 마운트를 유지한 채 카드가 layout으로 늘어난다.
 * S3 선택은 카드 자체 탭이 주 수단(같은 카드 재탭 시 해제)이고, CourseDropdown은 같은
 * selectedOrder를 비추는 보조 컨트롤이다.
 */
"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { fadeSwap, sectionEnter } from "@/app/_components/motion/tokens";
import { getApiErrorMessage } from "@/app/_api/client";
import { buildKakaoRouteUrl } from "../_lib/geo";
import { usePlanDetail, useSavePlanDay } from "../_hooks/usePlanQueries";
import { selectIsEditing, usePlanEditStore } from "../_store/usePlanEditStore";
import PlanHeader from "./_components/PlanHeader";
import DayChips from "./_components/DayChips";
import PlanMap from "./_components/PlanMap";
import CourseHeader from "./_components/CourseHeader";
import PlaceList from "./_components/PlaceList";
import type { PlanPlace } from "../_types";

export default function PlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("plan");

  const { data, isPending, isError, refetch } = usePlanDetail(planId);
  const { mutateAsync, isPending: isSaving } = useSavePlanDay();

  const draft = usePlanEditStore((s) => s.draft);
  const beginEdit = usePlanEditStore((s) => s.beginEdit);
  const removePlace = usePlanEditStore((s) => s.removePlace);
  const reorder = usePlanEditStore((s) => s.reorder);
  const discard = usePlanEditStore((s) => s.discard);

  // mode/dayIndex는 초기 activeDay를 한 번만 시딩하는 데 쓰이므로 구독 대신
  // getState()로 한 번만 읽는다(구독하면 스토어가 바뀔 때마다 불필요한 리렌더가 생긴다).
  const [activeDay, setActiveDay] = useState(() => {
    const s = usePlanEditStore.getState();
    return s.mode === "edit" ? s.dayIndex : 0;
  });
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isEditing = usePlanEditStore(selectIsEditing(planId, activeDay));
  const day = data?.days.find((d) => d.dayIndex === activeDay);
  const places = isEditing ? draft : (day?.places ?? []);

  const handleSelectDay = useCallback(
    (i: number) => {
      if (isEditing) return;
      setActiveDay(i);
      setSelectedOrder(null);
      setSaveError(null);
    },
    [isEditing],
  );

  const handleEdit = useCallback(() => {
    if (!day) return;
    beginEdit(planId, activeDay, day.places);
    setSelectedOrder(null);
    setSaveError(null);
  }, [beginEdit, planId, activeDay, day]);

  const handleEditDone = useCallback(async () => {
    try {
      await mutateAsync({ planId, dayIndex: activeDay, places: draft });
      discard();
      setSaveError(null);
    } catch (err) {
      setSaveError(getApiErrorMessage(err, t("saveError")));
    }
  }, [mutateAsync, planId, activeDay, draft, discard, t]);

  const handleReorder = useCallback(
    (next: PlanPlace[]) => {
      reorder(next);
    },
    [reorder],
  );

  const handleDelete = useCallback(
    (id: string) => {
      removePlace(id);
    },
    [removePlace],
  );

  // 카드 탭으로 selected 토글(같은 카드 재탭 시 해제). CourseDropdown은 같은 selectedOrder
  // 상태를 비추는 보조 컨트롤로 남는다. 편집 중에는 카드가 탭 불가(variant="edit")이므로
  // 지도 마커도 같은 규칙을 따른다 — 편집 중 선택이 남아 있으면 삭제·재정렬의 order 재부여로
  // selectedOrder가 엉뚱한 장소를 가리켜 지도가 튄다.
  const handleToggleSelect = useCallback(
    (order: number) => {
      if (isEditing) return;
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
    router.push(`/${locale}/plan/${planId}/search?day=${activeDay}`);
  }, [router, locale, planId, activeDay]);

  return (
    <div className="flex h-dvh flex-col">
      <PlanHeader title={data?.name ?? ""} />
      <AnimatePresence mode="wait" initial={false}>
        {isError ? (
          <motion.div
            key="error"
            {...fadeSwap}
            className="flex flex-1 flex-col items-center justify-center gap-3"
          >
            <p className="text-[13px] font-medium text-subtext">
              {t("loadError")}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
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
              disabled={isEditing}
            />
            <div className="flex min-h-0 flex-1 flex-col gap-[21px] px-4">
              <PlanMap
                places={places}
                selectedOrder={selectedOrder}
                onSelectOrder={setSelectedOrder}
                onToggleOrder={handleToggleSelect}
                showDropdown={!isEditing && places.length > 0}
              />
              <div className="flex min-h-0 flex-1 flex-col gap-[14px]">
                <motion.div {...sectionEnter(3)} className="shrink-0">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={`day-${activeDay}`} {...fadeSwap}>
                      <CourseHeader
                        count={places.length}
                        isEditing={isEditing}
                        saving={isSaving}
                        onEdit={handleEdit}
                        onEditDone={handleEditDone}
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
                <motion.div
                  {...sectionEnter(4, true)}
                  layoutScroll
                  className="min-h-0 flex-1 overflow-y-auto pb-[82px]"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={`day-${activeDay}`} {...fadeSwap}>
                      <PlaceList
                        places={places}
                        isEditing={isEditing}
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
                          className="px-4 pt-3 text-[12px] font-medium leading-[1.6] text-error"
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
    </div>
  );
}
