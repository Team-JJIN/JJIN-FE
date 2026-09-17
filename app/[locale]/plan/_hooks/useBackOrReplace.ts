/**
 * @hook useBackOrReplace
 * 일정 상세 헤더의 닫기(X)에 쓴다. 히스토리 스택이 있으면 뒤로가기(앱 안에서 온 곳으로),
 * 딥링크 등으로 히스토리 없이 바로 진입한 경우엔 fallback 경로로 교체 이동한다.
 * 주의: `history.length > 1`은 다른 사이트에서 넘어온 경우에도 참이라 앱 밖으로 back될 수 있다.
 * 하드 로드에서만 렌더되는 화면(직접 진입 검색 페이지)에는 쓰지 않는다 — 그런 화면의 이전 항목은
 * 항상 다른 문서라 back()이 풀 리로드가 되어 클라이언트 상태(편집 draft)가 사라진다.
 */
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useBackOrReplace(): (fallback: string) => void {
  const router = useRouter();

  return useCallback(
    (fallback: string) => {
      if (window.history.length > 1) {
        router.back();
      } else {
        router.replace(fallback);
      }
    },
    [router],
  );
}
