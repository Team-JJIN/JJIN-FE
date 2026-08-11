/**
 * @component AddToggleButton
 * 미션 카드의 '추가' 상태 토글 표시 버튼. 미추가 = 검정 pill + 흰 텍스트 + PlusIcon,
 * 추가됨 = lime pill + 검정 텍스트 + CheckIcon. 클릭 시 상위(카드) 탭과 분리되도록 이벤트 전파를 막는다.
 * size="small"은 검색 카드(Step 4)용 원형 아이콘 버튼. 미추가 = 반투명 흰 원 + 검정 PlusIcon,
 * 추가됨 = lime-vivid 원 + 흰 CheckIcon (디자인 실측: 원 지름 36px).
 */
"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { CheckIcon, PlusIcon } from "@/app/_components/icons";

interface AddToggleButtonProps {
  isAdded: boolean;
  onClick: () => void;
  size?: "big" | "small";
}

export default function AddToggleButton({
  isAdded,
  onClick,
  size = "big",
}: AddToggleButtonProps) {
  const t = useTranslations("mission");

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onClick();
    },
    [onClick],
  );

  if (size === "small") {
    // 검색 카드(Step 4) 썸네일 위 원형 아이콘 버튼
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isAdded}
        aria-label={t("addLabel")}
        className={`flex size-[36px] items-center justify-center rounded-full border shadow-[0px_2px_3.5px_0px_rgba(23,23,23,0.16)] transition-colors ${
          isAdded
            ? "border-lime-vivid bg-lime-vivid text-white"
            : "border-line bg-white/80 text-dark"
        }`}
      >
        {isAdded ? <CheckIcon size={20} /> : <PlusIcon size={20} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isAdded}
      className={`flex shrink-0 items-center rounded-full py-[3px] pl-[8px] pr-[14px] text-[12px] font-bold transition-colors ${
        isAdded ? "bg-lime-vivid text-dark" : "bg-dark text-white"
      }`}
    >
      {isAdded ? (
        <CheckIcon size={24} />
      ) : (
        // 플러스 글리프는 체크보다 시각 밀도가 높아 작게 렌더링하되,
        // 24px 박스를 유지해 상태 전환 시 버튼 높이(30px)가 흔들리지 않게 한다
        <span className="flex size-[24px] items-center justify-center">
          <PlusIcon size={16} />
        </span>
      )}
      <span>{t("addLabel")}</span>
    </button>
  );
}
