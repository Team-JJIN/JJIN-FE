/**
 * @hook useKakaoLoader
 * Kakao Maps SDK 로드 상태 구독. 재방문 시 next/script가 같은 src를 재삽입하지 않아 onLoad가
 * 안 올 수 있으므로, 마운트 시 window.kakao.maps.load가 이미 있으면 즉시 load를 호출해
 * ready로 올린다.
 */
"use client";

import { useEffect } from "react";
import { useKakaoStore } from "../_store/useKakaoStore";
import type { KakaoStatus } from "../_store/useKakaoStore";

export function useKakaoLoader(): KakaoStatus {
  const status = useKakaoStore((s) => s.status);
  const setStatus = useKakaoStore((s) => s.setStatus);

  useEffect(() => {
    if (status === "ready") return;
    if (typeof window !== "undefined" && window.kakao?.maps?.load) {
      window.kakao.maps.load(() => setStatus("ready"));
    }
  }, [status, setStatus]);

  return status;
}
