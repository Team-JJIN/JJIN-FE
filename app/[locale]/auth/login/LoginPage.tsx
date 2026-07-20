"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Button from "@/app/_components/ui/Button";
import Input from "@/app/_components/ui/Input";

type LoginForm = { email: string; password: string };

export default function LoginPage() {
  const t = useTranslations("login");
  const router = useRouter();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (_data: LoginForm) => {
    router.push(`/${locale}/onboarding`);
  };

  return (
    <div className="flex h-dvh flex-col bg-white px-5">
      {/* 상단 여백 */}
      <div className="flex-[2]" />

      {/* 로고 */}
      <div className="flex h-[20vh] w-full items-center justify-center rounded-2xl bg-neutral-100">
        <span className="text-lg font-bold tracking-widest text-neutral-400">JJIN</span>
      </div>

      {/* 로고~폼 간격 8% */}
      <div className="flex-[0.8]" />

      {/* 폼 */}
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
          <Input
            type="text"
            placeholder={t("email")}
            error={errors.email && t("errorEmailRequired")}
            {...register("email", { required: true })}
          />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            error={errors.password && t("errorPasswordRequired")}
            rightElement={
              <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-sm text-neutral-400">
                {showPassword ? t("hide") : t("show")}
              </button>
            }
            {...register("password", { required: true })}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            {t("loginButton")}
          </Button>
        </form>

        <div className="flex items-center justify-between mt-4">
          <button type="button" className="text-sm text-neutral-500">{t("forgotPassword")}</button>
          <button type="button" onClick={() => router.push(`/${locale}/auth/signup`)} className="text-sm font-semibold text-blue-500">
            {t("signUp")}
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-xs text-neutral-400">{t("orContinueWith")}</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <Button variant="outline" fullWidth>{t("google")}</Button>
      </div>

      {/* 하단 빈 공간 40% */}
      <div className="flex-[4]" />
    </div>
  );
}
