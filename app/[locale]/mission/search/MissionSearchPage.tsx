/**
 * @component MissionSearchPage
 * 미션 검색 피드 페이지. 검색어(300ms 디바운스) + 카테고리/난이도 필터 + 정렬을 조합해
 * useMissionSearch로 무한 스크롤 결과를 2열 그리드로 보여준다. 카드 탭 시 상세 팝업,
 * 추가/해제 인터랙션은 추천 탭(MissionHomePage)과 동일한 패턴(전역 추가 오버레이 + 해제 확인 다이얼로그)을 따른다.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowBackIcon,
  StarIcon,
  ChevronDownIcon,
} from "@/app/_components/icons";
import Dialog from "@/app/_components/ui/Dialog";
import { DIFFICULTIES } from "../_constants";
import {
  useMissionSearch,
  useRemoveMissionFromPlan,
} from "../_hooks/useMissionQueries";
import { useInfiniteScroll } from "../_hooks/useInfiniteScroll";
import { useAddMissionStore } from "../_store/useAddMissionStore";
import MissionCardSmall from "../_components/MissionCardSmall";
import SortPopover from "../_components/SortPopover";
import CategorySheet from "../_components/CategorySheet";
import MissionDetailPopup from "../_components/MissionDetailPopup";
import type {
  Mission,
  MissionCategory,
  MissionDifficulty,
  MissionSort,
} from "@/app/_api/missions";

export default function MissionSearchPage() {
  const t = useTranslations("mission");
  const router = useRouter();
  const openAddMission = useAddMissionStore((s) => s.open);

  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categories, setCategories] = useState<MissionCategory[]>([]);
  const [difficulty, setDifficulty] = useState<MissionDifficulty | null>(null);
  const [sort, setSort] = useState<MissionSort>("popular");
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [detailMission, setDetailMission] = useState<Mission | null>(null);
  const [removalTarget, setRemovalTarget] = useState<Mission | null>(null);

  // 실제 쿼리에는 디바운스된 값만 사용한다 (타이핑 중 매 글자마다 요청 방지)
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchInput), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const searchParams = useMemo(
    () => ({ query: debouncedQuery, categories, difficulty, sort }),
    [debouncedQuery, categories, difficulty, sort],
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    refetch,
  } = useMissionSearch(searchParams);

  const removeMissionMutation = useRemoveMissionFromPlan();

  const missions = useMemo<Mission[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    enabled: !!hasNextPage && !isFetchingNextPage,
    rootRef: scrollContainerRef,
  });

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDifficultyChange = useCallback(
    (level: MissionDifficulty | null) => {
      setDifficulty(level);
    },
    [],
  );

  const handleCategoryConfirm = useCallback((next: MissionCategory[]) => {
    setCategories(next);
    setCategorySheetOpen(false);
  }, []);

  const handleSelectMission = useCallback((mission: Mission) => {
    setDetailMission(mission);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailMission(null);
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

  // 카테고리 버튼 라벨: 0개=기본 라벨, 1개=해당 카테고리명, 2개 이상="{카테고리명} 외 N"
  const categoryButtonLabel = useMemo(() => {
    if (categories.length === 0) return t("categoryLabel");
    if (categories.length === 1) return t(`categories.${categories[0]}`);
    return t("categoryMore", {
      name: t(`categories.${categories[0]}`),
      count: categories.length - 1,
    });
  }, [categories, t]);

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      <div className="flex items-center gap-2 pt-[32px] pb-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="flex h-10 w-10 shrink-0 items-center justify-center -ml-2 text-dark"
        >
          <ArrowBackIcon size={24} />
        </button>
        <input
          autoFocus
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-[44px] flex-1 rounded-[14px] bg-surface px-3 text-[14px] font-medium outline-none placeholder:text-muted"
        />
      </div>

      <div
        className="flex items-center gap-[6px] overflow-x-auto py-2 scrollbar-hide"
        role="group"
        aria-label={t("filterGroupLabel")}
      >
        <button
          type="button"
          onClick={() => setCategorySheetOpen(true)}
          className="flex shrink-0 items-center gap-1 rounded-full bg-surface px-3 py-1 text-[12px] font-medium whitespace-nowrap text-subtext"
        >
          <span>{categoryButtonLabel}</span>
          <ChevronDownIcon size={14} />
        </button>

        {[null, ...DIFFICULTIES].map((level) => {
          const selected = difficulty === level;
          return (
            <button
              key={level ?? "all"}
              type="button"
              onClick={() => handleDifficultyChange(level)}
              aria-pressed={selected}
              aria-label={
                level === null
                  ? t("filters.all")
                  : t("difficultyValue", { level })
              }
              className={`flex h-[26px] shrink-0 items-center gap-[2px] rounded-full px-3 py-1 transition-colors ${
                selected ? "bg-dark text-white" : "bg-surface text-subtext"
              }`}
            >
              {level === null ? (
                <span className="text-[12px] font-medium">
                  {t("filters.all")}
                </span>
              ) : (
                Array.from({ length: level }).map((_, i) => (
                  <StarIcon key={i} size={12} />
                ))
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[13px] font-medium text-subtext">
          {t("totalCount", { count: totalCount })}
        </span>
        <SortPopover sort={sort} onChange={setSort} />
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
            <div className="grid grid-cols-2 gap-x-[9px] gap-y-[18px]">
              {missions.map((mission) => (
                <MissionCardSmall
                  key={mission.id}
                  mission={mission}
                  onAddClick={handleAddClick}
                  onSelect={handleSelectMission}
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

      <CategorySheet
        open={categorySheetOpen}
        categories={categories}
        query={debouncedQuery}
        difficulty={difficulty}
        onClose={() => setCategorySheetOpen(false)}
        onConfirm={handleCategoryConfirm}
      />

      <MissionDetailPopup
        mission={detailMission}
        onClose={handleCloseDetail}
        onAddClick={handleAddClick}
      />

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
