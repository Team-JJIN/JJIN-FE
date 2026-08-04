/**
 * @component MissionHomePage
 * 미션 추천 탭 페이지. 검색 진입 바 + 필터 칩 + 무한 스크롤 미션 카드 목록으로 구성된다.
 */
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { PlusIcon, SearchIcon } from "@/app/_components/icons";
import Dialog from "@/app/_components/ui/Dialog";
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
    refetch,
  } = useMissionList(filter);

  const removeMissionMutation = useRemoveMissionFromPlan();

  const missions = useMemo<Mission[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    enabled: !!hasNextPage && !isFetchingNextPage,
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
      <div className="flex items-center justify-between pt-[32px] pb-4">
        <h1 className="text-[19px] font-semibold tracking-[-0.095px] text-dark">
          {t("title")}
        </h1>
        <button
          type="button"
          onClick={goToCreate}
          aria-label={t("create.title")}
        >
          <PlusIcon />
        </button>
      </div>

      {/* input을 button으로 감싸면 유효하지 않은 HTML 중첩이 되므로 div + onClick으로 처리 */}
      <div
        onClick={goToSearch}
        className="flex h-[44px] cursor-pointer items-center rounded-[14px] bg-surface px-3"
      >
        <input
          readOnly
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-muted"
        />
        <SearchIcon className="text-muted" />
      </div>

      <div
        className="mt-3 flex gap-[5px] overflow-x-auto pb-1 scrollbar-hide"
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
              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap transition-colors ${
                selected ? "bg-dark text-white" : "bg-surface text-subtext"
              }`}
            >
              {t(`filters.${f}`)}
            </button>
          );
        })}
      </div>

      <div
        ref={scrollContainerRef}
        className="mt-[15px] flex-1 overflow-y-auto pb-6"
      >
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <p className="text-[13px] font-medium text-subtext">
              {t("errorLoad")}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white"
            >
              {t("retry")}
            </button>
          </div>
        ) : isPending ? (
          <div className="flex items-center justify-center py-20">
            <div
              aria-hidden="true"
              className="size-8 animate-spin rounded-full border-[3px] border-surface border-t-dark"
            />
          </div>
        ) : missions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px] font-medium text-subtext">
              {t("emptyList")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-[22px]">
              {missions.map((mission) => (
                <MissionCardBig
                  key={mission.id}
                  mission={mission}
                  onAddClick={handleAddClick}
                />
              ))}
            </div>

            <div ref={sentinelRef} />

            {isFetchingNextPage && (
              <p className="py-4 text-center text-[12px] text-muted">...</p>
            )}
          </>
        )}
      </div>

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
