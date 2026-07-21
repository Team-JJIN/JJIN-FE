/**
 * @component ResetButton
 * 초기화 버튼. ↺ 아이콘 + "초기화" 텍스트.
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
      className="flex items-center gap-1.5 text-[13px] text-[#737373]"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#737373" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8a6 6 0 0111.5-2.5M14 8a6 6 0 01-11.5 2.5" />
        <path d="M2 3v3h3M14 13v-3h-3" />
      </svg>
      초기화
    </button>
  );
}
