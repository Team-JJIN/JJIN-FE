/**
 * @hook useInfiniteScroll
 * IntersectionObserver로 센티널 요소가 뷰포트에 들어오면 onLoadMore를 호출한다.
 * rootMargin 200px 사전 로드, StrictMode 이중 마운트에도 안전하게 cleanup 처리.
 */
"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  enabled: boolean;
  rootRef?: React.RefObject<HTMLElement | null>;
}

export function useInfiniteScroll({
  onLoadMore,
  enabled,
  rootRef,
}: UseInfiniteScrollOptions) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const target = ref.current;
    if (!target || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { root: rootRef?.current ?? null, rootMargin: "200px" },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
    // rootRef.current는 리렌더를 트리거하지 않으므로, 마운트 시점에 root가 아직 비어있다가
    // 이후 채워지는 경우에도 observer를 다시 생성하도록 의존성에 명시적으로 포함한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, rootRef?.current]);

  return ref;
}
