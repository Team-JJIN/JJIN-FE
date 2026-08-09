"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import CodeBox from "@/app/_components/ui/CodeBox";
import { sendVerificationCode, verifyCode } from "@/app/_api/auth";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 300;

export default function EmailVerifyPage() {
  const t = useTranslations("emailVerification");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const isComplete = otp.every((v) => v !== "");
  const sentRef = useRef(false);

  // 페이지 진입 시 인증코드 자동 발송 (1회만)
  useEffect(() => {
    if (email && !sentRef.current) {
      sentRef.current = true;
      sendVerificationCode(email);
    }
  }, [email]);

  // 쿨다운 타이머
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
    sendVerificationCode(email);
  };

  const handleConfirm = async () => {
    if (!isComplete || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await verifyCode(email, otp.join(""));
      router.push(`/${locale}/auth/signup?verified=true&email=${encodeURIComponent(email)}`);
    } catch {
      setError(true);
      setOtp(Array(OTP_LENGTH).fill(""));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      <h1 className="pt-[7vh] text-[22px] font-semibold tracking-[-1%] text-dark">
        {t("title")}
      </h1>
      <p className="mt-[7px] text-[12px] font-medium text-[#737373]">
        {t("subtitle", { email })}
      </p>

      <div className="mt-[12px]">
        <CodeBox length={OTP_LENGTH} value={otp} onChange={handleOtpChange} error={error} />
      </div>

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

      <div className="flex-1" />

      <div className="pb-[43px]">
        <BigButton fullWidth disabled={!isComplete} isLoading={isSubmitting} onClick={handleConfirm}>
          {t("confirm")}
        </BigButton>
      </div>
    </div>
  );
}
