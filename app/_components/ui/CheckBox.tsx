/**
 * @component Checkbox
 * 16x16 원(#F7F7F7) 안에 체크마크. 활성: #9B9B9B 체크, 비활성: 더 연한 #D4D4D4 체크.
 * 라벨은 12px regular #737373.
 */
"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export default function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" onClick={onChange}>
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
      <span className="text-[12px] font-normal text-subtext">{label}</span>
    </label>
  );
}
