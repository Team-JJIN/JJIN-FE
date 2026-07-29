/**
 * @component LanguageOption
 * 선택 전: surface(#F7F7F7) 배경 | 선택 시: Pale Lime 배경
 */
"use client";

import { cn } from "@/lib/utils";

interface LanguageOptionProps {
  label: string;
  locale: string;
  selected: boolean;
  onSelect: (locale: string) => void;
}

export default function MediumButton({ label, locale, selected, onSelect }: LanguageOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(locale)}
      className={cn(
        "w-full h-[48px] rounded-xl text-[14px] font-medium leading-[160%] transition-colors duration-150",
        selected ? "bg-lime text-dark" : "bg-surface text-dark"
      )}
    >
      {label}
    </button>
  );
}
