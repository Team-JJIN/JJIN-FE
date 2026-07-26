/**
 * @component CodeBox
 * 6자리 인증코드 입력. 값 있을 때 lime 배경+네온 보더. 자동 포커스 이동.
 */
"use client";

import { useRef, KeyboardEvent, ClipboardEvent } from "react";

interface CodeBoxProps {
  length?: number;
  value: string[];
  onChange: (value: string[]) => void;
  error?: boolean;
}

export default function CodeBox({ length = 6, value, onChange, error = false }: CodeBoxProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const next = [...value];
    next[index] = char;
    onChange(next);
    if (char && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    const next = Array(length).fill("");
    pasted.split("").forEach((char, i) => { next[i] = char; });
    onChange(next);
    inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`h-[48px] w-full rounded-[12px] text-center text-[18px] font-semibold border-2 transition-colors duration-150 focus:outline-none ${
            error
              ? "border-red-400 bg-red-50"
              : value[i]
                ? "bg-[#EEFFAA] border-[#CCFF00]"
                : "bg-[#F7F7F7] border-transparent focus:border-[#CCFF00] focus:bg-[#EEFFAA]"
          }`}
        />
      ))}
    </div>
  );
}
