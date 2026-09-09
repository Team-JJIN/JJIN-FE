/**
 * @component CourseDropdown
 * 지도 좌상단 코스 선택 드롭다운. SortPopover 구조를 복제한다.
 * 루트를 absolute inset-0 pointer-events-none로 지도 박스 전체를 컨테이닝 블록으로 삼아
 * 백드롭(열렸을 때만)이 지도 영역 전체를 덮고, 트리거·리스트박스는 pointer-events-auto로
 * 되돌려 지도 상호작용을 막지 않는다.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { popover } from "@/app/_components/motion/tokens";

interface CourseDropdownProps {
  count: number;
  selectedOrder: number | null;
  onSelect: (n: number) => void;
}

export default function CourseDropdown({
  count,
  selectedOrder,
  onSelect,
}: CourseDropdownProps) {
  const t = useTranslations("plan");
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const handleSelect = useCallback(
    (n: number) => {
      onSelect(n);
      setOpen(false);
    },
    [onSelect],
  );

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {open && (
        <div
          className="absolute inset-0 pointer-events-auto"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <div className="absolute left-[13px] top-[15px] pointer-events-auto">
        <button
          type="button"
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="h-[27px] rounded-full border-[1.5px] border-lime-vivid bg-lime-pale px-3 py-1 text-[12px] font-medium leading-[1.6] text-ink transition duration-150 motion-safe:active:scale-[0.96]"
        >
          {selectedOrder
            ? t("courseOption", { n: selectedOrder })
            : t("courseSelect")}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="listbox"
              {...popover}
              className="pointer-events-auto absolute left-0 top-full z-40 mt-2 w-[120px] overflow-hidden rounded-[12px] bg-white shadow-[0px_4px_16px_0px_rgba(23,23,23,0.12)] origin-top-left"
            >
              {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
                const selected = n === selectedOrder;
                return (
                  <button
                    key={n}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(n)}
                    className="block w-full px-[14px] py-[11px] text-left text-[13px] font-medium text-ink transition duration-150 active:bg-surface"
                  >
                    {t("courseOption", { n })}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
