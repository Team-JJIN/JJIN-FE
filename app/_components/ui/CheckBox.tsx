/**
 * @component Checkbox
 * 동그란 원 안에 체크마크. 비활성: 흰 배경 + 회색 체크. 활성: lime 배경 + 검정 체크.
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
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors ${
          checked ? "bg-lime" : "bg-[#F0F0F0]"
        }`}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke={checked ? "#171717" : "#9B9B9B"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6l2.5 2.5L9.5 4" />
        </svg>
      </span>
      <span className="text-[12px] font-normal text-[#737373]">{label}</span>
    </label>
  );
}
