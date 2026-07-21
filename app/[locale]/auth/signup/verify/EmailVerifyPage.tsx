"use client";

import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Button from "@/app/_components/ui/Button";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

export default function EmailVerifyPage() {
  const t = useTranslations("emailVerification");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "your@email.com";

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = otp.every((v) => v !== "");

  // 쿨타임 타이머
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // OTP 입력 핸들러
  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    setError(false);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    if (char && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
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
      inputRefs.current[0]?.focus();
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
      <div className="mt-[12px] flex gap-2">
        {Array.from({ length: OTP_LENGTH }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`h-[48px] w-full rounded-[12px] text-center text-[18px] font-semibold transition-all duration-150 focus:outline-none ${
              otp[i]
                ? "bg-lime-light border-2 border-[#CCFF00]"
                : "bg-surface border border-transparent"
            } ${error ? "border-red-400 bg-red-50" : ""} focus:border-2 focus:border-[#CCFF00]`}
          />
        ))}
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
        <Button fullWidth disabled={!isComplete} isLoading={isSubmitting} onClick={handleConfirm}>
          {t("confirm")}
        </Button>
      </div>
    </div>
  );
}
