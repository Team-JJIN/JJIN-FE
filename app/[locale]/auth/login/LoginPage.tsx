"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import InputText from "@/app/_components/ui/InputText";
import { EyeIcon, EyeOffIcon } from "@/app/_components/icons";

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
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 로고 — 상단 중앙 */}
      <div className="flex flex-[2] flex-col items-center justify-center">
        <Image
          src="/image/JJIN.png"
          alt="JJIN"
          width={141}
          height={63}
          priority
          className="w-[141px] h-auto object-contain"
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
                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
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

        {/* Google 버튼 */}
        <button
          type="button"
          className="mt-[16px] flex h-[48px] w-full items-center justify-center gap-[10px] rounded-2xl border border-[#EAEBEC] bg-white text-[14px] font-medium text-dark"
        >
          <img src="/image/google-icon.svg" alt="Google" width={18} height={18} />
          Sign in with Google
        </button>

        {/* 하단 여백 */}
        <div className="h-[60px]" />
      </div>
    </div>
  );
}
