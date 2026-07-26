/**
 * @component ResetButton
 * 초기화 버튼. reset-icon.svg + "초기화" 텍스트.
 */
"use client";

interface ResetButtonProps {
  onClick: () => void;
}

export default function ResetButton({ onClick }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 font-[Noto_Sans_KR] text-[14px] font-normal text-[#2A2A2A]"
    >
      <img src="/image/reset-icon.svg" alt="" width={24} height={24} />
      초기화
    </button>
  );
}
