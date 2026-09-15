"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BigButton from "@/app/_components/ui/BigButton";
import InputText from "@/app/_components/ui/InputText";
import CheckBox from "@/app/_components/ui/CheckBox";
import { EyeIcon, EyeOffIcon } from "@/app/_components/icons";
import { signUp, getTerms, handleAuthSuccess, type TermsItem } from "@/app/_api/auth";
import { getApiErrorMessage } from "@/app/_api/client";

type SignUpForm = {
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function SignUpPage() {
  const t = useTranslations("signUp");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const isVerified = searchParams?.get("verified") === "true";
  const verifiedEmail = searchParams?.get("email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // 약관 상태
  const [terms, setTerms] = useState<TermsItem[]>([]);
  const [agreedTermIds, setAgreedTermIds] = useState<Set<number>>(new Set());

  const { register, watch } = useForm<SignUpForm>({
    defaultValues: {
      nickname: "",
      email: verifiedEmail || "",
      password: "",
      confirmPassword: "",
    },
  });

  const nickname = watch("nickname");
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const isNameValid = nickname.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
  const isConfirmMatch = password === confirmPassword && confirmPassword.length > 0;
  const allRequiredTermsAgreed = terms
    .filter((term) => term.required)
    .every((term) => agreedTermIds.has(term.id));
  const isFormValid = isNameValid && isEmailValid && isVerified && isPasswordValid && isConfirmMatch && allRequiredTermsAgreed;

  // 약관 목록 조회
  useEffect(() => {
    getTerms()
      .then((list) => {
        setTerms(list);
        if (process.env.NODE_ENV !== "production") {
          console.log("[signup] 약관 목록 조회 성공:", list);
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "production") {
          console.error("[signup] 약관 목록 조회 실패:", err);
        }
      });
  }, []);

  const toggleTerm = (id: number) => {
    setAgreedTermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRequestVerification = () => {
    if (!isEmailValid) {
      setEmailError(t("errorEmailInvalid"));
      return;
    }
    setEmailError("");
    router.push(`/${locale}/auth/signup/verify?email=${encodeURIComponent(email)}`);
  };

  const handlePasswordBlur = () => {
    if (password && !isPasswordValid) setPasswordError(t("errorPasswordInvalid"));
    else setPasswordError("");
  };

  const handleConfirmBlur = () => {
    if (confirmPassword && !isConfirmMatch) setConfirmError(t("errorPasswordMismatch"));
    else setConfirmError("");
  };

  const handleSubmit = async () => {
    if (!isFormValid) return;
    setSubmitError("");
    try {
      const termsAgreements = terms.map((term) => ({
        type: term.type,
        agreed: agreedTermIds.has(term.id),
      }));
      if (process.env.NODE_ENV !== "production") {
        console.log("[signup] 전송 termsAgreements:", termsAgreements);
      }
      const tokens = await signUp(email, nickname.trim(), password, termsAgreements);
      handleAuthSuccess(tokens, locale, (path) => router.push(path));
    } catch (err: unknown) {
      setSubmitError(getApiErrorMessage(err, t("errorSignUpFailed")));
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      <div className="pt-[7vh]">
        <h1 className="text-[22px] font-semibold text-ink">{t("title")}</h1>
        <p className="mt-[7px] text-[12px] font-medium text-subtext">{t("subtitle")}</p>
      </div>

      <div className="mt-[11px] flex flex-col gap-[16px]">
        {/* 이름 */}
        <InputText
          type="text"
          placeholder={t("name")}
          {...register("nickname")}
        />

        {/* 이메일 + 인증 */}
        <div className="flex gap-2">
          <div className="flex-1">
            <InputText
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
        <InputText
          type={showPassword ? "text" : "password"}
          placeholder={t("password")}
          error={passwordError}
          {...register("password")}
          onBlur={handlePasswordBlur}
          rightElement={
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-muted">
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          }
        />

        {/* 비밀번호 확인 */}
        <InputText
          type="password"
          placeholder={t("confirmPassword")}
          error={confirmError}
          {...register("confirmPassword")}
          onBlur={handleConfirmBlur}
        />

        {/* 약관 동의 (API에서 가져온 목록) */}
        <div className="flex flex-col gap-[10px] mt-[4px]">
          {terms.map((term) => (
            <CheckBox
              key={term.id}
              checked={agreedTermIds.has(term.id)}
              onChange={() => toggleTerm(term.id)}
              label={term.title}
            />
          ))}
        </div>
      </div>

      <div className="flex-1" />

      <div className="pb-[43px]">
        {submitError && (
          <p className="mb-[10px] text-center text-[12px] text-red-500">{submitError}</p>
        )}
        <BigButton fullWidth disabled={!isFormValid} onClick={handleSubmit}>
          {t("sendVerificationEmail")}
        </BigButton>
      </div>
    </div>
  );
}
