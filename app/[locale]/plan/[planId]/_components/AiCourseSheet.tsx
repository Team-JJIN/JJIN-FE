/**
 * @component AiCourseSheet
 * B-1 AI 코스 추천 바텀시트. 딤 위로 올라오며, 'AI 자동 코스 추천' 옵션 카드(단일)를 선택하고
 * '확인'을 누르면 코스 생성을 시작한다. X 또는 딤 탭 시 진행 없이 닫는다.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import BigButton from "@/app/_components/ui/BigButton";

interface AiCourseSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending?: boolean;
}

export default function AiCourseSheet({
  open,
  onClose,
  onConfirm,
  pending = false,
}: AiCourseSheetProps) {
  const t = useTranslations("plan.aiCourse");
  // 현재 옵션이 하나뿐이라 열릴 때 기본 선택 상태로 둔다.
  const [selected, setSelected] = useState(true);

  return (
    <BottomSheet
      open={open}
      animated
      title={t("sheetTitle")}
      titleClassName="text-[19px] font-semibold text-ink"
      closeLabel={t("sheetTitle")}
      heightClass="h-auto"
      footerShadow={false}
      onClose={onClose}
      footer={
        <BigButton
          fullWidth
          disabled={!selected || pending}
          isLoading={pending}
          onClick={onConfirm}
          aria-label={t("confirm")}
        >
          {t("confirm")}
        </BigButton>
      }
    >
      {/* 제목에서 27px 아래(헤더 pb-16 + mt-11 = 27px) */}
      <button
        type="button"
        onClick={() => setSelected((v) => !v)}
        aria-pressed={selected}
        className={`mt-[11px] flex w-full items-stretch overflow-hidden rounded-[16px] border-[1.5px] text-left transition-colors ${
          selected ? "border-lime-vivid" : "border-transparent"
        }`}
      >
        {/* 카드 전체 Pale Lime(F4FFD6) 배경: 왼쪽 JJ 로고(좌측 끝에서 20px) + 오른쪽 텍스트(로고에서 17px) */}
        <div className="flex flex-1 items-center bg-lime-pale py-[16px] pl-[20px] pr-[16px]">
          <Image
            src="/image/JJ.png"
            alt=""
            width={45}
            height={45}
            className="h-[45px] w-[45px] shrink-0 object-contain"
          />
          <div className="ml-[17px] flex flex-col justify-center">
            <p className="text-[15px] font-semibold text-ink">
              {t("optionTitle")}
            </p>
            <p className="mt-[4px] text-[12px] font-medium text-subtext">
              {t("optionDesc")}
            </p>
          </div>
        </div>
      </button>
    </BottomSheet>
  );
}
