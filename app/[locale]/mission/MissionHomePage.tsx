/**
 * @component MissionHomePage
 * 미션 추천 탭 페이지. 검색 진입 바 + 필터 칩 + 무한 스크롤 미션 카드 목록으로 구성된다.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { PlusIcon, SearchIcon } from "@/app/_components/icons";
import Dialog from "@/app/_components/ui/Dialog";
import {
  fadeSwap,
  listItemEnter,
  sectionEnter,
  TAP,
} from "@/app/_components/motion/tokens";
import { MISSION_FILTERS } from "./_constants";
import {
  useMissionList,
  useRemoveMissionFromPlan,
} from "./_hooks/useMissionQueries";
import { useInfiniteScroll } from "./_hooks/useInfiniteScroll";
import { useAddMissionStore } from "./_store/useAddMissionStore";
import MissionCardBig from "./_components/MissionCardBig";
import type { Mission, MissionFilter } from "@/app/_api/missions";

export default function MissionHomePage() {
  const t = useTranslations("mission");
  const router = useRouter();
  const locale = useLocale();
  const openAddMission = useAddMissionStore((s) => s.open);

  const [filter, setFilter] = useState<MissionFilter>("all");
  const [removalTarget, setRemovalTarget] = useState<Mission | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  } = useMissionList(filter);

  const removeMissionMutation = useRemoveMissionFromPlan();

  const missions = useMemo<Mission[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [displayedKey, setDisplayedKey] = useState<MissionFilter>(filter);
  // fresh 데이터가 도착한 렌더에서만 key 갱신 (render-phase 조정 — React 공식 패턴)
  if (!isPlaceholderData && displayedKey !== filter) {
    setDisplayedKey(filter);
  }

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [displayedKey]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    // !isError: 에러 상태에서도 센티널이 마운트 상태라 재시도 무한 루프를 막는다
    enabled:
      !!hasNextPage && !isFetchingNextPage && !isPlaceholderData && !isError,
    rootRef: scrollContainerRef,
  });

  const goToCreate = useCallback(() => {
    router.push(`/${locale}/mission/create`);
  }, [router, locale]);

  const goToSearch = useCallback(() => {
    router.push(`/${locale}/mission/search`);
  }, [router, locale]);

  const handleFilterChange = useCallback((f: MissionFilter) => {
    setFilter(f);
  }, []);

  const handleAddClick = useCallback(
    (mission: Mission) => {
      if (mission.isAdded) {
        setRemovalTarget(mission);
        return;
      }
      openAddMission(mission);
    },
    [openAddMission],
  );

  const handleRemovalCancel = useCallback(() => {
    setRemovalTarget(null);
  }, []);

  const handleRemovalConfirm = useCallback(() => {
    if (!removalTarget) return;
    removeMissionMutation.mutate(removalTarget.id);
    setRemovalTarget(null);
  }, [removalTarget, removeMissionMutation]);

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      <motion.div
        {...sectionEnter(0)}
        className="flex items-center justify-between pt-[32px] pb-4"
      >
        <h1 className="text-[19px] font-semibold tracking-[-0.095px] text-dark">
          {t("title")}
        </h1>
        <button
          type="button"
          onClick={goToCreate}
          aria-label={t("create.title")}
          className="transition duration-150 motion-safe:active:scale-90"
        >
          <PlusIcon />
        </button>
      </motion.div>

      {/* input을 button으로 감싸면 유효하지 않은 HTML 중첩이 되므로 div + onClick으로 처리 */}
      <motion.div
        {...sectionEnter(1)}
        onClick={goToSearch}
        whileTap={TAP.card}
        className="flex h-[44px] cursor-pointer items-center rounded-[14px] bg-[#F0F0F0] px-3"
      >
        <input
          readOnly
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-muted"
        />
        <SearchIcon className="text-muted" />
      </motion.div>

      <motion.div
        {...sectionEnter(2)}
        className="mt-3 flex gap-[5px] overflow-x-auto py-2 scrollbar-hide"
        role="group"
        aria-label={t("filterGroupLabel")}
      >
        {MISSION_FILTERS.map((f) => {
          const selected = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => handleFilterChange(f)}
              aria-pressed={selected}
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap transition motion-safe:active:scale-[0.96] ${
                selected ? "bg-dark text-white" : "bg-[#F0F0F0] text-subtext"
              }`}
            >
              {t(`filters.${f}`)}
            </button>
          );
        })}
      </motion.div>

      <motion.div
        {...sectionEnter(3, true)}
        ref={scrollContainerRef}
        className="-mx-[20px] flex-1 overflow-y-auto px-[20px] pt-[15px] pb-6"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isError ? (
            <motion.div
              key="error"
              {...fadeSwap}
              className="flex flex-col items-center justify-center gap-3 py-20"
            >
              <p className="text-[13px] font-medium text-subtext">
                {t("errorLoad")}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.97]"
              >
                {t("retry")}
              </button>
            </motion.div>
          ) : isPending ? (
            <motion.div
              key="pending"
              {...fadeSwap}
              className="flex items-center justify-center py-20"
            >
              <div
                aria-hidden="true"
                className="size-8 animate-spin rounded-full border-[3px] border-surface border-t-dark"
              />
            </motion.div>
          ) : missions.length === 0 ? (
            <motion.div
              key="empty"
              {...fadeSwap}
              className="flex items-center justify-center py-20"
            >
              <p className="text-[13px] font-medium text-subtext">
                {t("emptyList")}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`list-${displayedKey}`}
              {...fadeSwap}
              className="flex flex-col gap-[22px]"
            >
              {missions.map((mission, index) => (
                <motion.div key={mission.id} {...listItemEnter(index)}>
                  <MissionCardBig
                    mission={mission}
                    onAddClick={handleAddClick}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 센티널·다음페이지 표시는 AnimatePresence 밖(스크롤 컨테이너 직계)에 유지 —
            keyed 리마운트에 휘말리면 IntersectionObserver가 죽은 노드를 관찰해 무한스크롤이 죽는다 */}
        <div ref={sentinelRef} />

        {isFetchingNextPage && (
          <p className="py-4 text-center text-[12px] text-muted">...</p>
        )}
      </motion.div>

      <Dialog
        open={removalTarget !== null}
        title={t("remove.confirmTitle", { title: removalTarget?.title ?? "" })}
        description={t("remove.confirmDesc")}
        cancelLabel={t("remove.cancel")}
        confirmLabel={t("remove.confirm")}
        onCancel={handleRemovalCancel}
        onConfirm={handleRemovalConfirm}
      />
    </div>
  );
}
