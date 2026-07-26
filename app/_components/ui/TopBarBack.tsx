/**
 * @component TopBarBack
 * 뒤로가기(왼쪽) + 선택적 오른쪽 텍스트 버튼 (건너뛰기 등)
 */
"use client";

interface TopBarBackProps {
  onBack: () => void;
  rightText?: string;
  onRightClick?: () => void;
}

export default function TopBarBack({ onBack, rightText, onRightClick }: TopBarBackProps) {
  return (
    <div className="flex items-center justify-between pt-[4vh]">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center -ml-2"
        aria-label="Go back"
      >
        <img src="/image/arrow_back.svg" alt="뒤로" width={24} height={24} />
      </button>
      {rightText && (
        <button type="button" onClick={onRightClick} className="text-[13px] text-[#737373]">
          {rightText}
        </button>
      )}
    </div>
  );
}
