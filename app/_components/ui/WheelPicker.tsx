/**
 * @component WheelPicker
 * 스크롤 다이얼. 선택 행 lime 하이라이트. 스크롤바 숨김.
 */
"use client";

import { useRef, useEffect, useCallback } from "react";

interface WheelPickerProps {
  items: string[];
  value: string;
  onChange: (val: string) => void;
}

const ITEM_H = 40;
const VISIBLE = 7;

export default function WheelPicker({ items, value, onChange }: WheelPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idx = items.indexOf(value);

  useEffect(() => {
    if (ref.current && idx >= 0) {
      ref.current.scrollTop = idx * ITEM_H;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!ref.current) return;
      const i = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(i, items.length - 1));
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      if (items[clamped] !== value) onChange(items[clamped]);
    }, 100);
  }, [items, value, onChange]);

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="relative overflow-y-scroll scrollbar-hide"
      style={{
        height: ITEM_H * VISIBLE,
      }}
    >
      {/* 상단 패딩 */}
      <div style={{ height: ITEM_H * 3 }} />

      {items.map((item, i) => {
        const dist = Math.abs(i - idx);
        const opacity = dist === 0 ? 1 : dist === 1 ? 0.6 : dist === 2 ? 0.35 : 0.2;
        const scale = dist === 0 ? 1 : dist === 1 ? 0.9 : 0.8;

        return (
          <div
            key={`${item}-${i}`}
            className="flex items-center justify-center"
            style={{ height: ITEM_H, opacity, transform: `scale(${scale})` }}
          >
            <span className="text-[20px] font-normal text-[#2A2A2A]">{item}</span>
          </div>
        );
      })}

      {/* 하단 패딩 */}
      <div style={{ height: ITEM_H * 3 }} />
    </div>
  );
}
