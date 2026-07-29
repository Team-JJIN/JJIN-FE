/**
 * @component BottomSheet
 * 하단 바텀시트. 상단 타이틀 + X 닫기, 콘텐츠, aboveFooter, 하단 푸터.
 * 접근성: role="dialog", aria-modal, ESC 키 닫기 지원.
 */
"use client";

import { useEffect, useCallback } from "react";
import TopBarClose from "./TopBarClose";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  aboveFooter?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function BottomSheet({ open, title, onClose, children, aboveFooter, footer }: BottomSheetProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex flex-col bg-white rounded-t-[16px] h-[95%]"
      >
        <div className="px-[20px] pt-[32px] pb-4">
          <TopBarClose title={title} onClose={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-[20px] pb-4">
          {children}
        </div>

        {aboveFooter && (
          <div className="flex justify-center pb-[30px]">
            {aboveFooter}
          </div>
        )}

        {footer && (
          <div className="px-[20px] py-[29px] bg-white rounded-t-[16px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
