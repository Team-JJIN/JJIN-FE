/**
 * @component SortPopover
 * 정렬 트리거 버튼 + 앵커된 드롭다운 패널. 트리거를 감싸는 relative 래퍼 기준으로
 * absolute right-0 top-full에 패널을 배치한다. 바깥 탭 감지는 relative 래퍼 밖에
 * 별도의 전체 화면 투명 백드롭(absolute inset-0)을 두어 처리하며(고정 위치 금지 원칙상
 * fixed 대신 상위 relative 조상인 앱 셸에 자연히 귀속된다), 트리거·패널은 백드롭보다
 * 높은 z-index로 감싸 항상 클릭 가능하도록 한다.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDownIcon, CheckRoundedIcon } from "@/app/_components/icons";
import { popover } from "@/app/_components/motion/tokens";
import { SORT_OPTIONS } from "../_constants";
import type { MissionSort } from "@/app/_api/missions";

interface SortPopoverProps {
  sort: MissionSort;
  onChange: (sort: MissionSort) => void;
}

export default function SortPopover({ sort, onChange }: SortPopoverProps) {
  const t = useTranslations("mission");
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
    (value: MissionSort) => {
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
          className="flex items-center gap-1 text-[13px] font-medium text-subtext transition duration-150 motion-safe:active:scale-[0.97]"
        >
          <span>{t(`sort.${sort}`)}</span>
          <ChevronDownIcon
            size={16}
            className={`transition-transform duration-200 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              role="listbox"
              {...popover}
              className="absolute right-0 top-full z-40 mt-2 w-[120px] overflow-hidden rounded-[12px] bg-white shadow-[0px_4px_16px_0px_rgba(23,23,23,0.12)] origin-top-right"
            >
              {SORT_OPTIONS.map((option) => {
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
                    <span>{t(`sort.${option}`)}</span>
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
