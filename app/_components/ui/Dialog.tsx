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
import Spinner from "@/app/_components/ui/Spinner";

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  onExitComplete?: () => void;
  confirmLoading?: boolean;
  loadingLabel?: string;
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
  confirmLoading = false,
  loadingLabel = confirmLabel,
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
            onClick={() => {
              if (!confirmLoading) onCancel();
            }}
            aria-hidden="true"
            {...dimFade}
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex w-[85%] flex-col rounded-[16px] bg-white p-[20px]"
            style={{ height: 200 }}
            {...centerPanel}
          >
            <button
              type="button"
              onClick={onCancel}
              disabled={confirmLoading}
              aria-label={cancelLabel}
              className="absolute right-[16px] top-[16px] text-[18px] text-neutral-400 leading-none transition duration-150 motion-safe:active:scale-90"
            >
              ✕
            </button>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <h2 className="text-[19px] font-semibold text-ink">{title}</h2>
              {description && (
                <p className="mt-[15px] text-[14px] font-medium text-ink">
                  {description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-[16px]">
              <button
                type="button"
                onClick={onCancel}
                className="h-[48px] flex-1 rounded-[16px] bg-surface text-[15px] font-semibold text-ink transition duration-150 motion-safe:active:scale-[0.98]"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={confirmLoading}
                aria-busy={confirmLoading}
                className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-[16px] bg-dark text-[15px] font-semibold text-lime-vivid transition duration-150 disabled:cursor-wait disabled:opacity-70 motion-safe:active:scale-[0.98]"
              >
                {confirmLoading && <Spinner />}
                {confirmLoading ? loadingLabel : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
