/**
 * @component TopBarClose
 * 제목(왼쪽) + X 닫기(오른쪽). 바텀시트 상단용.
 */
"use client";

interface TopBarCloseProps {
  title: string;
  onClose: () => void;
  /** X 버튼의 접근 가능한 이름. 미전달 시 기존처럼 라벨 없음(호출부에서 t("close") 전달 권장) */
  closeLabel?: string;
}

export default function TopBarClose({
  title,
  onClose,
  closeLabel,
}: TopBarCloseProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[18px] font-semibold text-[#171717]">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="text-[22px] text-neutral-400 leading-none"
      >
        ✕
      </button>
    </div>
  );
}
