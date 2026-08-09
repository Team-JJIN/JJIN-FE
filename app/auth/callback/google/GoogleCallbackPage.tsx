"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginWithGoogle } from "@/app/_api/auth";
import { saveTokens } from "@/app/_api/token";
import { ApiError } from "@/app/_api/client";

type ErrorState = {
  status: number;
  message: string;
} | null;

const ERROR_TITLES: Record<number, string> = {
  400: "잘못된 요청입니다.",
  401: "인증에 실패했습니다.",
  404: "요청한 정보를 찾을 수 없습니다.",
  500: "서버 오류가 발생했습니다.",
};

/**
 * Google OAuth callback 처리 페이지 (locale 밖 고정 경로).
 * /auth/callback/google?code=...&state={locale}
 * → /api/auth/login/google 호출 → 토큰 저장 → locale 기반 라우팅
 */
export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const called = useRef(false);
  const [error, setError] = useState<ErrorState>(null);

  const locale = searchParams?.get("state") ?? "en";

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const rawCode = searchParams?.get("code");
    const oauthError = searchParams?.get("error");

    if (oauthError || !rawCode) {
      router.replace(`/${locale}/auth/login`);
      return;
    }

    const code = decodeURIComponent(rawCode);

    (async () => {
      try {
        const { accessToken, refreshToken, role } = await loginWithGoogle(code);
        saveTokens(accessToken, refreshToken);
        router.replace(role === "ONBOARDING" ? `/${locale}/onboarding` : `/${locale}/home`);
      } catch (err) {
        if (err instanceof ApiError) {
          setError({ status: err.status, message: err.message });
        } else {
          setError({ status: 0, message: "서버에 연결할 수 없습니다." });
        }
      }
    })();
  }, [searchParams, router, locale]);

  if (error) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-white px-[20px]">
        <p className="text-[15px] font-semibold text-dark mb-[8px]">
          {ERROR_TITLES[error.status] ?? "오류가 발생했습니다."}
        </p>
        <p className="text-[12px] text-muted mb-[4px]">{error.message}</p>
        <p className="text-[11px] text-neutral-400 mb-[24px]">
          에러 코드: {error.status || "연결 실패"}
        </p>
        <button
          type="button"
          onClick={() => router.replace(`/${locale}/auth/login`)}
          className="text-[14px] font-semibold text-dark underline"
        >
          로그인으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-lime" />
        <p className="text-[13px] text-muted">로그인 중...</p>
      </div>
    </div>
  );
}
