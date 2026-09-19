"use client";

/**
 * @hook useAuthExpired
 * API 클라이언트가 토큰 재발급에 실패할 때 dispatch하는 `auth:expired` 이벤트를 수신해
 * 현재 locale의 /auth 경로로 replace한다.
 *
 * - 이미 /auth 경로에 있으면 무시 (중복 리다이렉트 방지)
 * - usePathname으로 현재 경로를 감지해 window.location 직접 참조를 피한다
 * 사용처: AuthGuard (app/_components/providers/AuthGuard.tsx)
 */

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "./useLocale";

export function useAuthExpired() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    const handler = () => {
      // 이미 auth 경로에 있으면 중복 리다이렉트하지 않는다
      if (pathname.includes("/auth")) return;
      router.replace(`/${locale}/auth`);
    };

    window.addEventListener("auth:expired", handler);
    return () => window.removeEventListener("auth:expired", handler);
  }, [router, pathname, locale]);
}
