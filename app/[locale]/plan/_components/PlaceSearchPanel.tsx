/**
 * @component PlaceSearchPanel
 * 장소 검색 공유 패널(인터셉트 슬라이드 패널·직접 진입 페이지가 공용). 인풋 + 상태 분기(대기/에러/결과)를 그린다.
 * 검색은 서버 1-based 페이지를 10개씩 가져온다. 최근 검색은 localStorage(계정 무관).
 */
"use client";

import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import InputText from "@/app/_components/ui/InputText";
import { SearchIcon } from "@/app/_components/icons";
import { fadeSwap } from "@/app/_components/motion/tokens";
import { usePlaceSearch } from "../_hooks/usePlanQueries";
import { useRecentPlaceSearches } from "../_hooks/useRecentPlaceSearches";
import { usePlanEditStore } from "../_store/usePlanEditStore";
import { SEARCH_DEBOUNCE_MS } from "../_constants";
import { useDebouncedValue } from "@/app/_components/hooks/useDebouncedValue";
import PlaceSearchResultCard from "./PlaceSearchResultCard";
import RecentSearchChips from "./RecentSearchChips";
import type { PlaceSearchResult } from "../_types";

export default function PlaceSearchPanel() {
  const t = useTranslations("plan");
  const { planId } = useParams<{ planId: string }>();

  const [keyword, setKeyword] = useState("");
  const debounced = useDebouncedValue(keyword, SEARCH_DEBOUNCE_MS);
  const {
    data,
    isPending,
    isError,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePlaceSearch(planId, debounced);
  const results = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;
  const { recent, addRecent } = useRecentPlaceSearches();
  const draft = usePlanEditStore((s) => s.draft);
  const original = usePlanEditStore((s) => s.original);
  const toggleFromSearch = usePlanEditStore((s) => s.toggleFromSearch);

  const isAdded = useCallback(
    (r: PlaceSearchResult) => draft.some((p) => p.placeId === r.id),
    [draft],
  );

  const handleToggle = useCallback(
    (r: PlaceSearchResult) => {
      if (r.alreadyAdded && !original.some((p) => p.placeId === r.id)) return;
      const alreadyAdded = draft.some((p) => p.placeId === r.id);
      toggleFromSearch(r);
      if (!alreadyAdded && debounced.trim() !== "") {
        addRecent(debounced);
      }
    },
    [draft, original, toggleFromSearch, debounced, addRecent],
  );

  const handleRecentSelect = useCallback(
    (k: string) => {
      setKeyword(k);
      addRecent(k);
    },
    [addRecent],
  );

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return;
      if (e.key === "Enter") addRecent(keyword);
    },
    [addRecent, keyword],
  );

  const trimmedKeyword = keyword.trim();
  const waitingForKeyword = trimmedKeyword !== debounced.trim();
  const branch: "idle" | "loading" | "error" | "results" =
    trimmedKeyword === ""
      ? "idle"
      : waitingForKeyword || (isPending && !data)
        ? "loading"
        : isError
          ? "error"
          : "results";

  return (
    <>
      <div className="px-4 py-[6px]">
        <InputText
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={t("search.placeholder")}
          rightElement={<SearchIcon className="text-[#9b9b9b]" />}
          enterKeyHint="search"
          autoFocus
          aria-label={t("search.placeholder")}
          className="h-11 rounded-[14px] border-0 bg-surface pl-3 pr-12 text-[14px] font-medium leading-[1.6] placeholder:text-muted focus:ring-2 focus:ring-dark"
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          {branch === "idle" && (
            <motion.div
              key="idle"
              {...fadeSwap}
              className="flex min-h-0 flex-1 flex-col"
            >
              {recent.length > 0 && (
                <div className="pt-[14px]">
                  <RecentSearchChips
                    items={recent}
                    onSelect={handleRecentSelect}
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                <p className="text-[15px] font-medium leading-[1.7] text-subtext">
                  {t("search.emptyLine1")}
                  <br />
                  {t("search.emptyLine2")}
                </p>
              </div>
            </motion.div>
          )}

          {branch === "error" && (
            <motion.div
              key="error"
              {...fadeSwap}
              className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center"
            >
              <p className="text-[15px] font-medium leading-[1.7] text-subtext">
                {t("search.error")}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.97]"
              >
                {t("retry")}
              </button>
            </motion.div>
          )}

          {branch === "loading" && (
            <motion.div
              key="loading"
              {...fadeSwap}
              role="status"
              aria-live="polite"
              className="flex flex-1 flex-col items-center justify-center gap-3 px-4"
            >
              <div
                aria-hidden="true"
                className="size-8 animate-spin rounded-full border-[3px] border-surface border-t-dark motion-reduce:animate-none"
              />
              <p className="text-[13px] font-medium text-subtext">
                {t("search.loading")}
              </p>
            </motion.div>
          )}

          {branch === "results" && (
            <motion.div
              key="results"
              {...fadeSwap}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex h-[15px] items-end justify-between px-4 mt-[20px]">
                <p className="text-[12px] font-medium leading-[1.6] text-subtext">
                  {t("search.resultCount")}{" "}
                  <span className="text-ink">{totalCount}</span>
                </p>
                {isFetching && !isFetchingNextPage && (
                  <span
                    role="status"
                    aria-live="polite"
                    className="text-[12px] text-subtext"
                  >
                    {t("search.refreshing")}
                  </span>
                )}
              </div>

              {!isPending && data && results.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
                  <p className="text-[15px] font-medium leading-[1.7] text-subtext">
                    {t("search.emptyLine1")}
                    <br />
                    {t("search.emptyLine2")}
                  </p>
                </div>
              )}

              {!isPending && data && results.length > 0 && (
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-[17px] pb-6">
                  <div className="flex flex-col gap-[14px]">
                    {results.map((r, i) => (
                      <PlaceSearchResultCard
                        key={r.id}
                        result={r}
                        added={isAdded(r)}
                        unavailable={
                          r.alreadyAdded &&
                          !original.some((p) => p.placeId === r.id)
                        }
                        onToggle={() => handleToggle(r)}
                        index={i}
                      />
                    ))}
                    {hasNextPage && (
                      <button
                        type="button"
                        disabled={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                        className="self-center rounded-full bg-dark px-5 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
                      >
                        {isFetchingNextPage ? (
                          <span
                            role="status"
                            aria-live="polite"
                            className="flex items-center gap-2"
                          >
                            <span
                              aria-hidden="true"
                              className="size-3 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                            />
                            {t("search.loadingMore")}
                          </span>
                        ) : (
                          t("search.loadMore")
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
