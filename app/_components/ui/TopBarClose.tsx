/**
 * @component TopBarClose
 * 제목(왼쪽) + X 닫기(오른쪽). 바텀시트 상단용.
 */
"use client";

interface TopBarCloseProps {
  title: string;
  onClose: () => void;
}

export default function TopBarClose({ title, onClose }: TopBarCloseProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[18px] font-semibold text-[#171717]">{title}</h2>
      <button type="button" onClick={onClose} className="text-[22px] text-neutral-400 leading-none">✕</button>
    </div>
  );
}
