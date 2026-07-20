/**
 * @component LanguageOption
 * @prop locale    언어 코드 ("en" | "ja" | "zh" | "ko")
 * @prop label     표시할 언어 이름
 * @prop selected  선택 시 파란 테두리 + 배경
 * @prop onSelect  클릭 콜백 — locale 값 전달
 */
"use client";

import { cn } from "@/lib/utils";

interface LanguageOptionProps {
  label: string;
  locale: string;
  selected: boolean;
  onSelect: (locale: string) => void;
}

export default function LanguageOption({
  label,
  locale,
  selected,
  onSelect,
}: LanguageOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(locale)}
      className={cn(
        "w-full h-12 rounded-xl border text-base font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        selected
          ? "border-blue-400 bg-blue-50 text-blue-600"
          : "border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50"
      )}
    >
      {label}
      {selected && " ✓"}
    </button>
  );
}
