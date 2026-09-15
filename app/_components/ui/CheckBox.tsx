/**
 * @component Checkbox
 * 16x16 원(#F7F7F7) 안에 체크마크. 활성: #9B9B9B 체크, 비활성: 더 연한 #D4D4D4 체크.
 * 라벨은 12px regular #737373.
 * labelHref가 있으면 라벨을 새 탭 링크로 렌더하고, 라벨 클릭은 체크 토글과 분리한다.
 */
"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  labelHref?: string;
}

export default function Checkbox({ checked, onChange, label, labelHref }: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        aria-label={label}
        className="flex items-center"
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
            checked ? "bg-lime-vivid" : "bg-surface"
          }`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke={checked ? "#171717" : "#D4D4D4"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 6l2.5 2.5L9.5 4" />
          </svg>
        </span>
      </button>

      {labelHref ? (
        <a
          href={labelHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] font-normal text-subtext underline-offset-2 hover:underline"
        >
          {label}
        </a>
      ) : (
        <button
          type="button"
          onClick={onChange}
          className="text-[12px] font-normal text-subtext"
        >
          {label}
        </button>
      )}
    </div>
  );
}
