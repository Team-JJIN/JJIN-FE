/**
 * @component Dropdown
 * 단일 선택 드롭다운. 토글 열림/닫힘. DateRangePicker와 동일한 스타일.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "선택",
  disabled = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className={cn(
          "flex w-full h-12 items-center justify-between rounded-xl border px-4 text-sm transition-colors",
          value ? "text-neutral-900" : "text-neutral-400",
          disabled ? "border-neutral-100 bg-neutral-50 opacity-50" : "border-neutral-200 bg-white"
        )}
      >
        <span>{value || placeholder}</span>
        <span className="text-neutral-300">▼</span>
      </button>

      {open && (
        <ul className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-48 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  "w-full px-4 py-3 text-left text-sm transition-colors",
                  value === opt ? "bg-blue-50 text-blue-600 font-medium" : "text-neutral-800 hover:bg-neutral-50"
                )}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
