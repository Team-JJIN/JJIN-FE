/**
 * @hook useRecentPlaceSearches
 * 장소 검색 최근 검색어. localStorage에 최대 RECENT_SEARCH_MAX개 저장하고, 화면엔 RECENT_SEARCH_SHOWN개까지만 보여준다.
 * 초기 state는 빈 배열로 시작해 마운트 후 useEffect에서 읽는다 (SSR과의 불일치 방지).
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  RECENT_SEARCH_KEY,
  RECENT_SEARCH_MAX,
  RECENT_SEARCH_SHOWN,
} from "../_constants";

export function useRecentPlaceSearches(): {
  recent: string[];
  addRecent: (keyword: string) => void;
} {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_SEARCH_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
        setRecent(parsed);
      }
    } catch {
      // localStorage 접근 실패(프라이빗 모드 등) — 빈 목록 유지
    }
  }, []);

  const addRecent = useCallback((keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((k) => k !== trimmed)].slice(
        0,
        RECENT_SEARCH_MAX,
      );
      try {
        localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
      } catch {
        // 저장 실패는 무시 — 이번 세션 state는 정상 반영되고 다음 세션에만 사라진다
      }
      return next;
    });
  }, []);

  return { recent: recent.slice(0, RECENT_SEARCH_SHOWN), addRecent };
}
