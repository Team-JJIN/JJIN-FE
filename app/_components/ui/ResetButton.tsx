/**
 * @component ResetButton
 * 초기화 버튼. 인라인 아이콘 + "초기화" 텍스트.
 */
"use client";

import { ResetIcon } from "@/app/_components/icons";

interface ResetButtonProps {
  onClick: () => void;
}

export default function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[14px] font-normal text-[#2A2A2A]"
    >
      <ResetIcon size={24} className="text-[#9B9B9B]" />
      초기화
    </button>
  );
}
