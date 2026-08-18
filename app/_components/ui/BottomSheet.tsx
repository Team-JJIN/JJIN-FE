/**
 * @component BottomSheet
 * 하단 바텀시트. 상단 타이틀 + X 닫기, 콘텐츠, aboveFooter, 하단 푸터.
 * 접근성: role="dialog", aria-modal, ESC 키 닫기 지원.
 * animated=true면 framer-motion으로 아래→위 슬라이드 등장 / 아래로 슬라이드 퇴장 모션을 적용한다.
 * onExitComplete는 animated 경로에서만 의미가 있으며, 퇴장 모션이 끝난 뒤(예: 라우트 back) 호출된다.
 */
"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TopBarClose from "./TopBarClose";
import { useFocusTrap } from "@/app/_components/hooks/useFocusTrap";

interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  aboveFooter?: React.ReactNode;
  footer?: React.ReactNode;
  heightClass?: string;
  animated?: boolean;
  onExitComplete?: () => void;
  /** X 버튼의 접근 가능한 이름 (TopBarClose로 전달) */
  closeLabel?: string;
}

export default function BottomSheet({
  open,
  title,
  onClose,
  children,
  aboveFooter,
  footer,
  heightClass = "h-[95%]",
  animated = false,
  onExitComplete,
  closeLabel,
}: BottomSheetProps) {
  const panelRef = useFocusTrap(open);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (animated) {
    return (
      <AnimatePresence onExitComplete={onExitComplete}>
        {open && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end">
            <motion.div
              className="absolute inset-0 bg-black/30"
              onClick={onClose}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />

            <motion.div
              ref={panelRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={`relative flex flex-col bg-white rounded-t-[16px] ${heightClass}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            >
              <div className="px-[20px] pt-[32px] pb-4">
                <TopBarClose
                  title={title}
                  onClose={onClose}
                  closeLabel={closeLabel}
                />
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex flex-col bg-white rounded-t-[16px] ${heightClass}`}
      >
        <div className="px-[20px] pt-[32px] pb-4">
          <TopBarClose
            title={title}
            onClose={onClose}
            closeLabel={closeLabel}
          />
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-[20px] pb-4">
          {children}
        </div>

        {aboveFooter && (
          <div className="flex justify-center pb-[30px]">{aboveFooter}</div>
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
