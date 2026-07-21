"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Button from "@/app/_components/ui/Button";
import Input from "@/app/_components/ui/Input";
import Checkbox from "@/app/_components/ui/Checkbox";

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
};

export default function SignUpPage() {
  const t = useTranslations("signUp");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  // 인증 완료 여부 (이메일 인증 후 ?verified=true 로 돌아옴)
  const isVerified = searchParams?.get("verified") === "true";
  const verifiedEmail = searchParams?.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const { register, watch, setValue } = useForm<SignUpForm>({
    defaultValues: {
      email: verifiedEmail || "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
      agreeMarketing: false,
    },
  });

  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const agreeTerms = watch("agreeTerms");
  const agreeMarketing = watch("agreeMarketing");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
  const isConfirmMatch = password === confirmPassword && confirmPassword.length > 0;
  const isFormValid = isEmailValid && isVerified && isPasswordValid && isConfirmMatch && agreeTerms;

  // 인증 요청 클릭
  const handleRequestVerification = () => {
    if (!isEmailValid) {
      setEmailError(t("errorEmailInvalid"));
      return;
    }
    setEmailError("");
    router.push(`/${locale}/auth/signup/verify?email=${encodeURIComponent(email)}`);
  };

  // 비밀번호 blur
  const handlePasswordBlur = () => {
    if (password && !isPasswordValid) setPasswordError(t("errorPasswordInvalid"));
    else setPasswordError("");
  };

  // 비밀번호 확인 blur
  const handleConfirmBlur = () => {
    if (confirmPassword && !isConfirmMatch) setConfirmError(t("errorPasswordMismatch"));
    else setConfirmError("");
  };

  // 가입하기
  const handleSubmit = () => {
    if (!isFormValid) return;
    // TODO: API 회원가입 요청
    router.push(`/${locale}/onboarding`);
  };

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 제목 */}
      <div className="pt-[7vh]">
        <h1 className="text-[22px] font-semibold tracking-[-1%] text-dark">{t("title")}</h1>
        <p className="mt-1 text-[12px] font-medium text-[#737373]">{t("subtitle")}</p>
      </div>

      {/* 폼 */}
      <div className="flex flex-col gap-[12px] pt-[3vh]">
        {/* 이메일 + 인증 요청/완료 */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="email"
              placeholder={t("email")}
              error={emailError}
              disabled={isVerified}
              {...register("email")}
              onChange={(e) => { register("email").onChange(e); setEmailError(""); }}
            />
          </div>
          {isVerified ? (
            <div className="flex h-[44px] w-[88px] shrink-0 items-center justify-center rounded-[14px] bg-lime text-[12px] font-semibold text-dark">
              인증완료
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRequestVerification}
              className="h-[44px] w-[88px] shrink-0 rounded-[14px] border-[1.5px] border-[#CCFF00] bg-[#F4FFD6] text-[12px] font-normal text-dark"
            >
              {t("requestVerification")}
            </button>
          )}
        </div>

        {/* 비밀번호 */}
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={t("password")}
          error={passwordError}
          {...register("password")}
          onBlur={handlePasswordBlur}
          rightElement={
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {showPassword ? (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                )}
              </svg>
            </button>
          }
        />

        {/* 비밀번호 확인 */}
        <Input
          type="password"
          placeholder={t("confirmPassword")}
          error={confirmError}
          {...register("confirmPassword")}
          onBlur={handleConfirmBlur}
        />

        {/* 약관 동의 */}
        <div className="flex flex-col gap-[10px] mt-[4px]">
          <Checkbox
            checked={agreeTerms}
            onChange={() => setValue("agreeTerms", !agreeTerms)}
            label={t("agreeTerms")}
          />
          <Checkbox
            checked={agreeMarketing}
            onChange={() => setValue("agreeMarketing", !agreeMarketing)}
            label={t("agreeMarketing")}
          />
        </div>
      </div>

      {/* 빈 공간 */}
      <div className="flex-1" />

      {/* 하단 버튼 */}
      <div className="pb-[43px]">
        <Button fullWidth disabled={!isFormValid} onClick={handleSubmit}>
          {t("sendVerificationEmail")}
        </Button>
      </div>
    </div>
  );
}
