/**
 * @component MissionFeedPage
 * 미션 인증 피드 탭 페이지. 최신/인기/이번 주 핫 탭 전환 + 무한 스크롤 인증 피드 카드 목록으로 구성된다.
 */
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { SearchIcon } from "@/app/_components/icons";
import Dialog from "@/app/_components/ui/Dialog";
import { FEED_TABS } from "../_constants";
import {
  useFeed,
  useToggleFeedLike,
  useRemoveMissionFromPlan,
} from "../_hooks/useMissionQueries";
import { useInfiniteScroll } from "../_hooks/useInfiniteScroll";
import { useAddMissionStore } from "../_store/useAddMissionStore";
import FeedCard from "../_components/FeedCard";
import type { FeedPost, FeedTab, Mission } from "@/app/_api/missions";

export default function MissionFeedPage() {
  const t = useTranslations("mission");
  const router = useRouter();
  const locale = useLocale();
  const openAddMission = useAddMissionStore((s) => s.open);

  const [tab, setTab] = useState<FeedTab>("latest");
  const [removalTarget, setRemovalTarget] = useState<Mission | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    refetch,
  } = useFeed(tab);

  const toggleLikeMutation = useToggleFeedLike(tab);
  const removeMissionMutation = useRemoveMissionFromPlan();

  const posts = useMemo<FeedPost[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    enabled: !!hasNextPage && !isFetchingNextPage,
    rootRef: scrollContainerRef,
  });

  const goToSearch = useCallback(() => {
    router.push(`/${locale}/mission/search`);
  }, [router, locale]);

  const handleTabChange = useCallback((next: FeedTab) => {
    setTab(next);
  }, []);

  const handleLikeToggle = useCallback(
    (post: FeedPost) => {
      toggleLikeMutation.mutate({ postId: post.id, liked: !post.likedByMe });
    },
    [toggleLikeMutation],
  );

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
    <div className="flex h-dvh flex-col bg-white">
      <div className="flex items-center justify-between px-[20px] pt-[32px] pb-4">
        <h1 className="text-[19px] font-semibold tracking-[-0.095px] text-dark">
          {t("feedTitle")}
        </h1>
        <button
          type="button"
          onClick={goToSearch}
          aria-label={t("searchPlaceholder")}
        >
          <SearchIcon />
        </button>
      </div>

      <div
        role="tablist"
        aria-label={t("feedTitle")}
        className="flex gap-[2px] border-b border-line px-[20px]"
      >
        {FEED_TABS.map((f) => {
          const selected = tab === f;
          return (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => handleTabChange(f)}
              className={`shrink-0 border-b-2 p-[10px] text-[15px] font-semibold tracking-[-0.045px] transition-colors ${
                selected
                  ? "border-lime-vivid text-ink"
                  : "border-transparent text-muted"
              }`}
            >
              {t(`feed.tabs.${f}`)}
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
        ) : posts.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px] font-medium text-subtext">
              {t("emptyList")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col">
              {posts.map((post) => (
                <FeedCard
                  key={post.id}
                  post={post}
                  onLikeToggle={handleLikeToggle}
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
