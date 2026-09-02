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
const DEFAULT_ERROR_TITLE = "오류가 발생했습니다.";
const NETWORK_ERROR_MESSAGE = "서버에 연결할 수 없습니다.";

const LOADING_TEXT: Record<string, string> = {
  ko: "로그인 중...",
  en: "Logging in...",
  ja: "ログイン中...",
  zh: "登录中...",
};

const loadingText = (locale: string) => LOADING_TEXT[locale] ?? LOADING_TEXT.en;

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
        router.replace(role === "ONBOARDING" ? `/${locale}/onboarding` : `/${locale}/mission`);
      } catch (err) {
        if (err instanceof ApiError) {
          setError({ status: err.status, message: err.message });
        } else {
          setError({ status: 0, message: NETWORK_ERROR_MESSAGE });
        }
      }
    })();
  }, [searchParams, router, locale]);

  if (error) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-white px-[20px]">
        <p className="text-[15px] font-semibold text-dark mb-[8px]">
          {ERROR_TITLES[error.status] ?? DEFAULT_ERROR_TITLE}
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

  // 화면 정중앙에 JJIN 브랜드(lime) 스피너 + 로그인 중 안내
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-[16px] bg-white">
      <span
        className="h-[40px] w-[40px] animate-spin rounded-full border-[3px] border-[#EEF0F2] border-t-lime"
        role="status"
        aria-label={loadingText(locale)}
      />
      <p className="text-[14px] font-medium tracking-[-0.01em] text-[#8A8F96]">
        {loadingText(locale)}
      </p>
    </div>
  );
}
