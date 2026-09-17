/**
 * @component CourseError
 * AI 코스 생성 실패 화면. 자동 복귀하지 않고 좌측 상단 '<' 뒤로가기로만 이전 화면으로 돌아간다
 * (사용자가 안내 문구를 확인할 시간을 준다).
 * 로딩 화면과 동일한 중앙 레이아웃(JJ 로고 + 문구)에, 하단 Pale Lime 알약 토스트로 사유를 노출한다.
 * 422(취향/후보 부족)와 그 외 일반 실패를 문구로 구분한다.
 */
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowBackIcon } from "@/app/_components/icons";
import CourseToast from "./CourseToast";
import type { CourseErrorKind } from "../../_types";

interface CourseErrorProps {
  errorKind: CourseErrorKind;
  onBack: () => void;
}

export default function CourseError({ errorKind, onBack }: CourseErrorProps) {
  const t = useTranslations("plan.aiCourse");
  const tPlan = useTranslations("plan");
  const message = errorKind === "insufficient" ? t("errorInsufficient") : t("error");

  return (
    <div className="relative flex h-dvh flex-col bg-white">
      {/* 좌측 상단 '<' 뒤로가기: #9B9B9B, 상단에서 10px 아래 */}
      <button
        type="button"
        onClick={onBack}
        aria-label={tPlan("close")}
        className="absolute left-4 top-[10px] flex size-[28px] items-center justify-center text-[#9B9B9B] transition duration-150 motion-safe:active:scale-90"
      >
        <ArrowBackIcon size={24} />
      </button>

      <div className="flex flex-1 flex-col items-center justify-center px-[20px]">
        <Image
          src="/image/JJ.png"
          alt=""
          width={111}
          height={111}
          priority
          className="h-[111px] w-[111px] object-contain"
        />
        <p className="mt-[24px] text-center text-[22px] font-semibold text-ink">
          {t("failedTitle")}
        </p>
      </div>

      <CourseToast message={message} hint={t("errorHint")} />
    </div>
  );
}
