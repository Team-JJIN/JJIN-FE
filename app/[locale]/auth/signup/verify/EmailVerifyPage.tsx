"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import OtpInput from "@/app/_components/ui/OtpInput";
import Button from "@/app/_components/ui/Button";
import BackButton from "@/app/_components/ui/BackButton";
import Modal from "@/app/_components/ui/Modal";

const RESEND_SECONDS = 180;

export default function EmailVerifyPage() {
  const t = useTranslations("emailVerification");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams?.get("email") ?? "your email";

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleResend = () => {
    if (seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    setOtp(Array(6).fill(""));
  };

  const handleConfirm = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push(`/${locale}/auth/login`);
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex h-dvh flex-col bg-white px-5">
      {/* 뒤로가기 */}
      <div className="pt-[5vh]">
        <BackButton onClick={() => router.push(`/${locale}/auth/signup`)} />
      </div>

      {/* 제목 */}
      <div className="pt-[2vh]">
        <h1 className="text-xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          {t("subtitle", { email })}
        </p>
      </div>

      {/* OTP */}
      <div className="pt-[3vh]">
        <OtpInput value={otp} onChange={setOtp} />
        <p className="mt-4 text-sm text-neutral-500">
          {t("noCode")}{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={seconds > 0}
            className="font-semibold text-neutral-700 disabled:text-neutral-400"
          >
            {t("resend", { time: `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}` })}
          </button>
        </p>
      </div>

      {/* 빈 공간 */}
      <div className="flex-1" />

      {/* 하단 버튼 */}
      <div className="pb-8">
        <Button
          fullWidth
          isLoading={isSubmitting}
          disabled={otp.join("").length < 6}
          onClick={handleConfirm}
        >
          {t("confirm")}
        </Button>
      </div>

      {/* 인증 완료 팝업 */}
      <Modal open={showSuccess} onClose={handleSuccessClose}>
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-center font-semibold text-neutral-900">{t("successTitle")}</p>
          <p className="text-center text-sm text-neutral-500">{t("successMessage")}</p>
          <Button fullWidth onClick={handleSuccessClose}>{t("goToLogin")}</Button>
        </div>
      </Modal>
    </div>
  );
}
