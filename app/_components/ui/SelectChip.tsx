/**
 * @component SelectChip
 * 선택 가능한 칩. 비활성: #F7F7F7 배경. 활성: #F4FFD6 배경 + #CCFF00 1.5px 테두리.
 */
"use client";

interface SelectChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export default function SelectChip({
  label,
  selected,
  onToggle,
}: SelectChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={`rounded-full px-3 py-1 text-[12px] font-medium text-[#737373] transition whitespace-nowrap overflow-hidden text-ellipsis max-w-full motion-safe:active:scale-[0.96] ${
        selected
          ? "bg-[#F4FFD6] border-[1.5px] border-[#CCFF00]"
          : "bg-[#F7F7F7] border-[1.5px] border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
