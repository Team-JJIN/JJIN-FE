/**
 * @component MissionFeedPage
 * 미션 인증 피드 탭 페이지. 최신/인기/이번 주 핫/완료 미션 탭 전환 + 무한 스크롤 인증 피드 카드 목록.
 * 모션은 MissionHomePage와 같은 패턴:
 * - 헤더·탭바·스크롤러가 sectionEnter로 순차 등장 (스크롤러는 opacityOnly — transform이 있으면 absolute 자식/스크롤 기준이 깨짐)
 * - 탭 전환: keepPreviousData로 이전 목록을 유지하다가 새 데이터가 오면 displayedKey를 바꿔 fadeSwap 크로스페이드
 *   (displayedKey는 isPlaceholderData가 false일 때만 갱신 — render-phase setState로 한 프레임 안에 정합)
 * - 리스트 아이템은 listItemEnter(index) stagger, 선택 탭 밑줄은 layoutId로 슬라이드
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { SearchIcon } from "@/app/_components/icons";
import {
  fadeSwap,
  listItemEnter,
  sectionEnter,
  tabIndicator,
} from "@/app/_components/motion/tokens";
import { FEED_TABS } from "../_constants";
import { useFeed, useToggleFeedLike } from "../_hooks/useFeedQueries";
import { useInfiniteScroll } from "../_hooks/useInfiniteScroll";
import { useMissionSheetStore } from "../_store/useMissionSheetStore";
import { useCommentSheetStore } from "../_store/useCommentSheetStore";
import FeedCard from "../_components/FeedCard";
import type { FeedPost, FeedTab } from "@/app/_api/feed";

export default function MissionFeedPage() {
  const t = useTranslations("mission");
  const router = useRouter();
  const locale = useLocale();
  const openAddMission = useMissionSheetStore((s) => s.openAdd);
  const openComments = useCommentSheetStore((s) => s.openComments);

  const [tab, setTab] = useState<FeedTab>("latest");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    isPlaceholderData,
    refetch,
  } = useFeed(tab);

  const posts = useMemo<FeedPost[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 화면에 실제로 그려진 목록의 탭. placeholder(이전 탭 데이터)를 보여주는 동안은 이전 키를 유지해
  // AnimatePresence가 새 목록이 준비된 순간에만 크로스페이드하게 한다.
  const [displayedKey, setDisplayedKey] = useState<FeedTab>(tab);
  if (!isPlaceholderData && displayedKey !== tab) setDisplayedKey(tab);

  // 좋아요 낙관 패치는 화면에 그려진 목록(displayedKey)의 캐시에 써야 한다 — 탭 전환 중(placeholder 창)에는
  // tab이 이미 새 탭이라, tab을 쓰면 빈 캐시에 패치되고(하트가 안 바뀜) 새 탭의 최초 fetch까지 cancel/invalidate된다.
  const toggleLikeMutation = useToggleFeedLike(displayedKey);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
  }, [displayedKey]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: fetchNextPage,
    enabled:
      !!hasNextPage && !isFetchingNextPage && !isPlaceholderData && !isError,
    rootRef: scrollContainerRef,
  });

  const goToSearch = useCallback(() => {
    router.push(`/${locale}/mission/search`);
  }, [router, locale]);

  const handleTabChange = useCallback((next: FeedTab) => {
    setTab(next);
  }, []);

  const { mutate: toggleLike } = toggleLikeMutation;
  const handleLikeToggle = useCallback(
    (post: FeedPost) => {
      toggleLike(post.id);
    },
    [toggleLike],
  );

  return (
    <div className="flex h-dvh flex-col bg-white">
      <motion.div
        {...sectionEnter(0)}
        className="flex items-center justify-between px-[20px] pt-[32px] pb-4"
      >
        <h1 className="text-[19px] font-semibold tracking-[-0.095px] text-dark">
          {t("feedTitle")}
        </h1>
        <button
          type="button"
          onClick={goToSearch}
          aria-label={t("searchPlaceholder")}
          className="transition duration-150 motion-safe:active:scale-90"
        >
          <SearchIcon />
        </button>
      </motion.div>

      <motion.div
        {...sectionEnter(1)}
        role="tablist"
        aria-label={t("feedTitle")}
        className="flex gap-[2px] overflow-x-auto border-b border-line px-[20px]"
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
              className={`relative shrink-0 border-b-2 border-transparent p-[10px] text-[15px] font-semibold tracking-[-0.045px] transition-colors ${
                selected ? "text-ink" : "text-muted"
              }`}
            >
              {t(`feed.tabs.${f}`)}
              {selected && (
                // 버튼 자체 border(투명) 위에 겹치는 라임 밑줄. layoutId가 같은 요소로 취급해 탭 사이를 슬라이드한다
                <motion.span
                  layoutId="feed-tab-indicator"
                  aria-hidden="true"
                  transition={tabIndicator}
                  className="absolute inset-x-0 -bottom-[2px] h-[2px] bg-lime-vivid"
                />
              )}
            </button>
          );
        })}
      </motion.div>

      <motion.div
        {...sectionEnter(2, true)}
        ref={scrollContainerRef}
        className="mt-[15px] flex-1 overflow-y-auto pb-6"
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
                className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.96]"
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
          ) : posts.length === 0 ? (
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
              className="flex flex-col"
            >
              {posts.map((post, index) => (
                <motion.div key={post.id} {...listItemEnter(index)}>
                  <FeedCard
                    post={post}
                    onLikeToggle={handleLikeToggle}
                    onCommentClick={openComments}
                    onAddClick={openAddMission}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 센티널은 AnimatePresence 밖 — 목록 교체 중에도 항상 스크롤 끝에 있어야 한다 */}
        <div ref={sentinelRef} />

        {isFetchingNextPage && (
          <p className="py-4 text-center text-[12px] text-muted">...</p>
        )}
      </motion.div>
    </div>
  );
}
