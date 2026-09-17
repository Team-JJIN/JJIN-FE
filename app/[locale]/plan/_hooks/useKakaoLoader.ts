/**
 * @hook useKakaoLoader
 * Kakao Maps SDK 로드 상태 구독. 재방문 시 next/script가 같은 src를 재삽입하지 않아 onLoad가
 * 안 올 수 있으므로, 마운트 시 window.kakao.maps.load가 이미 있으면 즉시 load를 호출해
 * ready로 올린다. onLoad 자체가 유실된 경우를 대비해 LOAD_TIMEOUT_MS 뒤 한 번만 복구를
 * 시도하는 폴백도 둔다.
 */
"use client";

import { useEffect } from "react";
import { useKakaoStore } from "../_store/useKakaoStore";
import type { KakaoStatus } from "../_store/useKakaoStore";

/** onLoad가 유실됐을 때 한 번만 복구를 시도하는 시간(ms). 폴링하지 않는다. */
const LOAD_TIMEOUT_MS = 8000;

export function useKakaoLoader(): KakaoStatus {
  const status = useKakaoStore((s) => s.status);
  const setStatus = useKakaoStore((s) => s.setStatus);

  useEffect(() => {
    if (status === "ready") return;
    if (typeof window !== "undefined" && window.kakao?.maps?.load) {
      window.kakao.maps.load(() => setStatus("ready"));
    }
  }, [status, setStatus]);

  // 복구에 실패해도 "error"로 내리지 않는다 — "error"는 나가는 간선이 없는 종착 상태라
  // (KakaoMapsScript는 "idle"에서만 복귀하고 next/script는 같은 src를 재삽입하지 않는다)
  // 느린 회선에서 8초를 넘긴 정상 로드를 영구 실패로 굳혀 버린다. 진짜 실패는 onError가 잡는다.
  useEffect(() => {
    if (status !== "loading") return;
    const id = setTimeout(() => {
      window.kakao?.maps?.load(() => setStatus("ready"));
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [status, setStatus]);

  return status;
}
