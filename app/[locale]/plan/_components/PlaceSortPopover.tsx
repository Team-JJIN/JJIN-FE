/**
 * @component PlaceSortPopover
 * 장소 검색 결과 정렬 트리거 + 앵커된 드롭다운 패널. mission/_components/SortPopover.tsx 구조를
 * 그대로 복제하되, 화살표 아이콘 없이 현재 정렬 라벨만 노출한다(Figma "거리순" 그대로).
 * ④(코스 정렬)에서 SortPopover와 공용화 예정.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { CheckRoundedIcon } from "@/app/_components/icons";
import { popover } from "@/app/_components/motion/tokens";
import { PLACE_SORT_OPTIONS } from "../_constants";
import type { PlaceSort } from "../_types";

interface PlaceSortPopoverProps {
  sort: PlaceSort;
  onChange: (sort: PlaceSort) => void;
}

export default function PlaceSortPopover({
  sort,
  onChange,
}: PlaceSortPopoverProps) {
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
    (value: PlaceSort) => {
      onChange(value);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <>
      {open && (
        <div
          className="absolute inset-0 z-30"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <div className="relative z-40">
        <button
          type="button"
          onClick={handleToggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t("search.sortLabel")}
          className="text-[12px] font-medium leading-[1.6] text-subtext transition duration-150 motion-safe:active:scale-[0.97]"
        >
          {t(`search.sort.${sort}`)}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="listbox"
              {...popover}
              className="absolute right-0 top-full z-40 mt-2 w-[120px] overflow-hidden rounded-[12px] bg-white shadow-[0px_4px_16px_0px_rgba(23,23,23,0.12)] origin-top-right"
            >
              {PLACE_SORT_OPTIONS.map((option) => {
                const selected = option === sort;
                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => handleSelect(option)}
                    className="flex w-full items-center justify-between px-[14px] py-[11px] text-[13px] font-medium text-ink transition duration-150 active:bg-surface"
                  >
                    <span>{t(`search.sort.${option}`)}</span>
                    {selected && (
                      <CheckRoundedIcon size={18} className="text-[#9B9B9B]" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
