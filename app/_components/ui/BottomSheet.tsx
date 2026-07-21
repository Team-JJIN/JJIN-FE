/**
 * @component BottomSheet
 * 하단 바텀시트. 상단 타이틀 + X 닫기, 콘텐츠, 하단 푸터.
 */
"use client";

import { useEffect } from "react";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function BottomSheet({ open, title, onClose, children, footer }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative flex flex-col bg-white rounded-t-[16px] max-h-[90vh]">
        {/* 헤더 — 32px 상단 패딩 */}
        <div className="flex items-center justify-between px-[20px] pt-[32px] pb-4">
          <h2 className="text-[18px] font-semibold text-dark">{title}</h2>
          <button type="button" onClick={onClose} className="text-[22px] text-neutral-400 leading-none">✕</button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-[20px] pb-4">
          {children}
        </div>

        {/* 푸터 — 상단 보더, 29px 패딩 */}
        {footer && (
          <div className="px-[20px] py-[29px] border-t border-neutral-100 rounded-t-[16px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
