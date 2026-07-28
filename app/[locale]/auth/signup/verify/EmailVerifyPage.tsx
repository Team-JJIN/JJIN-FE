"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import CodeBox, { type CodeBoxHandle } from "@/app/_components/ui/CodeBox";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function EmailVerifyPage() {
  const t = useTranslations("emailVerification");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "your@email.com";
  const codeBoxRef = useRef<CodeBoxHandle>(null);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const isComplete = otp.every((v) => v !== "");

  // 쿨타임 타이머
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleOtpChange = (value: string[]) => {
    setError(false);
    setOtp(value);
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError(false);
    // TODO: API 재발송
  };

  const handleConfirm = async () => {
    if (!isComplete) return;
    setIsSubmitting(true);
    // TODO: API 검증
    await new Promise((r) => setTimeout(r, 800));

    // 성공 시 → 회원가입 페이지로 인증완료 상태 복귀
    const success = true; // TODO: 실제 검증 결과
    if (success) {
      router.push(`/${locale}/auth/signup?verified=true&email=${encodeURIComponent(email)}`);
    } else {
      setError(true);
      setOtp(Array(OTP_LENGTH).fill(""));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 제목 */}
      <h1 className="pt-[7vh] text-[22px] font-semibold tracking-[-1%] text-dark">
        {t("title")}
      </h1>

      {/* 설명 */}
      <p className="mt-[7px] text-[12px] font-medium text-[#737373]">
        {t("subtitle", { email })}
      </p>

      {/* OTP 입력 */}
      <div className="mt-[12px]">
        <CodeBox
          ref={codeBoxRef}
          length={OTP_LENGTH}
          value={otp}
          onChange={handleOtpChange}
          error={error}
        />
      </div>

      {/* 코드가 안 왔나요? + 재전송 */}
      <div className="mt-[12px] flex items-center justify-between">
        <span className="text-[12px] text-[#737373]">{t("noCode")}</span>
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-[12px] font-semibold text-dark disabled:text-muted"
        >
          {cooldown > 0 ? `${t("resendBtn")} (${cooldown}s)` : t("resendBtn")}
        </button>
      </div>

      {/* 빈 공간 */}
      <div className="flex-1" />

      {/* 확인 버튼 */}
      <div className="pb-[43px]">
        <BigButton fullWidth disabled={!isComplete} isLoading={isSubmitting} onClick={handleConfirm}>
          {t("confirm")}
        </BigButton>
      </div>
    </div>
  );
}
