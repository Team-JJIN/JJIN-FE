/**
 * @component Dialog
 * 화면 중앙 확인 다이얼로그. 딤 배경 탭/ESC로 취소, 우상단 X로 취소.
 * 접근성: role="dialog", aria-modal, ESC 키 닫기 지원 (BottomSheet.tsx 패턴 복제).
 */
"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFocusTrap } from "@/app/_components/hooks/useFocusTrap";
import { dimFade, centerPanel } from "@/app/_components/motion/tokens";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  onExitComplete?: () => void;
}

export default function Dialog({
  open,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  onExitComplete,
}: DialogProps) {
  const panelRef = useFocusTrap(open);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/30"
            onClick={onCancel}
            aria-hidden="true"
            {...dimFade}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative w-[85%] rounded-[16px] bg-white p-[20px]"
            {...centerPanel}
          >
            <button
              type="button"
              onClick={onCancel}
              aria-label={cancelLabel}
              className="absolute right-[16px] top-[16px] text-[18px] text-neutral-400 leading-none transition duration-150 motion-safe:active:scale-90"
            >
              ✕
            </button>

            <h2 className="text-[16px] font-semibold text-dark">{title}</h2>
            {description && (
              <p className="mt-2 text-[13px] font-medium text-neutral-500">
                {description}
              </p>
            )}

            <div className="mt-[24px] flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-[44px] flex-1 rounded-[14px] bg-surface text-[14px] font-semibold text-dark transition duration-150 motion-safe:active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="h-[44px] flex-1 rounded-[14px] bg-dark text-[14px] font-semibold text-lime-vivid transition duration-150 motion-safe:active:scale-[0.98]"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
