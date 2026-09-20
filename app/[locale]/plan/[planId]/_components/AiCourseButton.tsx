/**
 * @component AiCourseButton
 * 일정 상세(일정 탭) 하단에 떠 있는 'AI로 코스 생성' 버튼.
 * 하단 일정/미션 토글 바 위 38px 위치. 클릭 시 AI 코스 추천 바텀시트를 연다.
 */
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Spinner from "@/app/_components/ui/Spinner";

interface AiCourseButtonProps {
  onClick: () => void;
  pending?: boolean;
}

export default function AiCourseButton({
  onClick,
  pending = false,
}: AiCourseButtonProps) {
  const t = useTranslations("plan.aiCourse");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[120px] z-20 flex justify-end px-4">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-busy={pending}
        aria-label={t("generate")}
        className="pointer-events-auto flex h-[48px] items-center rounded-[20px] bg-lime-vivid pl-3 pr-4 shadow-[0px_4px_9.6px_0px_rgba(0,0,0,0.13)] transition-transform duration-150 ease-out motion-safe:hover:-translate-y-[2px] motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
      >
        {pending ? (
          <Spinner className="mx-[6px]" />
        ) : (
          <Image
            src="/image/ai-course-icon.png"
            alt=""
            width={28}
            height={28}
            className="h-[28px] w-[28px] object-contain"
          />
        )}
        <span className="ml-[4px] text-[14px] font-semibold text-ink">
          {t("generate")}
        </span>
      </button>
    </div>
  );
}
