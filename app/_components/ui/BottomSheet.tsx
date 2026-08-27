/**
 * @component BottomSheet
 * 하단 바텀시트. 상단 타이틀 + X 닫기, 콘텐츠, aboveFooter, 하단 푸터.
 * 접근성: role="dialog", aria-modal, ESC 키 닫기 지원.
 * animated=true면 framer-motion으로 아래→위 슬라이드 등장 / 아래로 슬라이드 퇴장 모션을 적용한다.
 * onExitComplete는 animated 경로에서만 의미가 있으며, 퇴장 모션이 끝난 뒤(예: 라우트 back) 호출된다.
 * onBack은 시트 내부에서 스텝을 되돌리는 용도로 TopBarClose의 ← 버튼을 켠다 (onClose와 별개).
 */
"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import TopBarClose from "./TopBarClose";
import { useFocusTrap } from "@/app/_components/hooks/useFocusTrap";
import { DUR, EASE } from "@/app/_components/motion/tokens";

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
  /** 전달 시 헤더에 ← 버튼 노출 (시트 내부 스텝 뒤로가기). 시트를 닫지는 않는다 */
  onBack?: () => void;
  /** ← 버튼의 접근 가능한 이름 (TopBarClose로 전달) */
  backLabel?: string;
  /** 본문 wrapper 모드: "scroll"(기본, 패딩+세로 스크롤) | "fill"(패딩·스크롤 없이 자식이 직접 채움) */
  contentMode?: "scroll" | "fill";
}

const SCROLL_CONTENT_CLASS =
  "flex-1 overflow-y-auto overscroll-contain scrollbar-hide px-[20px] pb-4";
const FILL_CONTENT_CLASS = "relative flex-1 min-h-0 overflow-hidden";

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
  onBack,
  backLabel,
  contentMode = "scroll",
}: BottomSheetProps) {
  const contentClass =
    contentMode === "fill" ? FILL_CONTENT_CLASS : SCROLL_CONTENT_CLASS;

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
              transition={{ duration: DUR.lg, ease: EASE.out }}
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
              transition={{ type: "tween", duration: DUR.lg, ease: EASE.out }}
            >
              <div className="px-[20px] pt-[32px] pb-4">
                <TopBarClose
                  title={title}
                  onClose={onClose}
                  closeLabel={closeLabel}
                  onBack={onBack}
                  backLabel={backLabel}
                />
              </div>

              <div className={contentClass}>{children}</div>

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
            onBack={onBack}
            backLabel={backLabel}
          />
        </div>

        <div className={contentClass}>{children}</div>

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
