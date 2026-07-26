"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import InputText from "@/app/_components/ui/InputText";
import PageTransition from "@/app/_components/PageTransition";

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const email = watch("email");
  const password = watch("password");
  const isFormFilled = !!email && !!password;

  const onSubmit = async (_data: LoginForm) => {
    // TODO: API 호출. 성공 시 온보딩 완료 여부에 따라 분기
    // 온보딩 미완료 → /onboarding, 완료 → /home
    router.push(`/${locale}/onboarding`);
  };

  return (
    <PageTransition>
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 로고 — 상단 중앙 */}
      <div className="flex flex-[2] flex-col items-center justify-center">
        <Image
          src="/image/logo.png"
          alt="JJIN"
          width={82}
          height={48}
          priority
          className="object-contain"
        />
        <p className="mt-[6px] text-[11px] font-normal text-[#C4C4C4]">
          Living life for real
        </p>
      </div>

      {/* 폼 영역 */}
      <div className="flex flex-[3] flex-col">
        {/* 이메일 + 비밀번호 */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[16px]">
          <InputText
            type="text"
            placeholder={t("email")}
            error={errors.email && t("errorEmailRequired")}
            {...register("email", { required: true })}
          />
          <InputText
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            error={errors.password && t("errorPasswordRequired")}
            rightElement={
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            }
            {...register("password", { required: true })}
          />

          {/* 로그인 버튼 — 16px gap */}
          <BigButton
            type="submit"
            variant="lime"
            fullWidth
            isLoading={isSubmitting}
            disabled={!isFormFilled}
          >
            {t("loginButton")}
          </BigButton>
        </form>

        {/* 비밀번호 찾기 / 회원가입 — 로그인 버튼에서 16px 아래 */}
        <div className="flex items-center justify-between mt-[16px]">
          <button type="button" className="text-[13px] text-neutral-500">
            {t("forgotPassword")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/auth/signup`)}
            className="text-[13px] font-semibold text-neutral-700"
          >
            {t("signUp")}
          </button>
        </div>

        {/* 또는 — 11px 아래 */}
        <div className="flex items-center gap-3 mt-[11px]">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-[12px] text-muted">{t("orContinueWith")}</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        {/* Google 버튼 — 16px 아래, h-[48px], border #EAEBEC 1px, rounded-lg */}
        <button
          type="button"
          className="mt-[16px] flex h-[48px] w-full items-center justify-center gap-[10px] rounded-2xl border border-[#EAEBEC] bg-white text-[14px] font-medium text-dark"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.581-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        {/* 하단 여백 */}
        <div className="h-[60px]" />
      </div>
    </div>
    </PageTransition>
  );
}
