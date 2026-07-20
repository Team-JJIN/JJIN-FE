"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Button from "@/app/_components/ui/Button";
import Input from "@/app/_components/ui/Input";
import Checkbox from "@/app/_components/ui/Checkbox";
import BackButton from "@/app/_components/ui/BackButton";

const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)/),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((v) => v),
    agreeMarketing: z.boolean().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"] });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const t = useTranslations("signUp");
  const router = useRouter();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { agreeTerms: false, agreeMarketing: false },
  });

  const handleRequestVerification = () => {
    const email = getValues("email");
    if (!email) return;
  };

  const onSubmit = async (data: SignUpForm) => {
    router.push(`/${locale}/auth/signup/verify?email=${encodeURIComponent(data.email)}`);
  };

  return (
    <div className="flex h-dvh flex-col bg-white px-5">
      {/* 뒤로가기 */}
      <div className="pt-[5vh]">
        <BackButton onClick={() => router.push(`/${locale}/auth/login`)} />
      </div>

      {/* 제목 */}
      <div className="pt-[2vh]">
        <h1 className="text-xl font-bold text-neutral-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-neutral-500">{t("subtitle")}</p>
      </div>

      {/* 폼 */}
      <form id="signup-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 pt-[3vh]">
        <Input
          type="email"
          placeholder={t("email")}
          error={errors.email && t("errorEmailInvalid")}
          rightElement={
            <button type="button" onClick={handleRequestVerification} className="whitespace-nowrap rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
              {t("requestVerification")}
            </button>
          }
          {...register("email")}
        />
        <Input
          type={showPassword ? "text" : "password"}
          placeholder={t("password")}
          error={errors.password && t("errorPasswordInvalid")}
          rightElement={
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-sm text-neutral-400">
              {showPassword ? t("hide") : t("show")}
            </button>
          }
          {...register("password")}
        />
        <Input
          type="password"
          placeholder={t("confirmPassword")}
          error={errors.confirmPassword && t("errorPasswordMismatch")}
          {...register("confirmPassword")}
        />
        <div className="flex flex-col gap-2 mt-1">
          <Checkbox label={t("agreeTerms")} {...register("agreeTerms")} />
          {errors.agreeTerms && <p className="text-xs text-red-500 ml-6">{t("errorAgreeTerms")}</p>}
          <Checkbox label={t("agreeMarketing")} {...register("agreeMarketing")} />
        </div>
      </form>

      {/* 빈 공간 */}
      <div className="flex-1" />

      {/* 하단 버튼 */}
      <div className="pb-8">
        <Button type="submit" form="signup-form" fullWidth isLoading={isSubmitting}>
          {t("sendVerificationEmail")}
        </Button>
      </div>
    </div>
  );
}
