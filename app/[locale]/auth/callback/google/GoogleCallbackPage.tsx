"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { loginWithGoogle } from "@/app/_api/auth";
import { saveTokens } from "@/app/_api/token";

/**
 * Google OAuth callback 처리 페이지.
 * Google이 ?code=...&state=locale 으로 리다이렉트해 주면
 * 백엔드 /api/auth/login/google 을 호출하고 토큰을 저장한 뒤 라우팅.
 */
export default function GoogleCallbackPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    // StrictMode 이중 실행 방지
    if (called.current) return;
    called.current = true;

    const code = searchParams?.get("code");
    const error = searchParams?.get("error");

    if (error || !code) {
      // 사용자가 구글 로그인을 취소하거나 에러 발생 시 로그인 페이지로 복귀
      router.replace(`/${locale}/auth/login`);
      return;
    }

    (async () => {
      try {
        const { accessToken, refreshToken, role } = await loginWithGoogle(code);
        saveTokens(accessToken, refreshToken);

        if (role === "ONBOARDING") {
          router.replace(`/${locale}/onboarding`);
        } else {
          router.replace(`/${locale}/home`);
        }
      } catch {
        // API 실패 시 로그인 페이지로 복귀
        router.replace(`/${locale}/auth/login`);
      }
    })();
  }, [searchParams, router, locale]);

  return (
    <div className="flex h-dvh items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        {/* 심플 스피너 */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-lime" />
        <p className="text-[13px] text-muted">로그인 중...</p>
      </div>
    </div>
  );
}
