/**
 * @component KakaoMapsScript
 * Kakao Maps SDK(JS) 스크립트 태그. plan 레이아웃에서 한 번만 마운트해 전역 로드 상태
 * (useKakaoStore)를 갱신한다. NEXT_PUBLIC_KAKAO_MAP_KEY가 없으면 스크립트를 렌더하지 않고
 * status를 "nokey"로 남긴다.
 */
"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useKakaoStore } from "../../_store/useKakaoStore";

export default function KakaoMapsScript() {
  const status = useKakaoStore((s) => s.status);
  const setStatus = useKakaoStore((s) => s.setStatus);

  const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!key) {
      setStatus("nokey");
      return;
    }
    if (status === "idle") {
      setStatus("loading");
    }
  }, [key, status, setStatus]);

  if (!key) return null;

  return (
    <Script
      src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`}
      strategy="afterInteractive"
      onLoad={() => window.kakao?.maps.load(() => setStatus("ready"))}
      onError={() => setStatus("error")}
    />
  );
}
