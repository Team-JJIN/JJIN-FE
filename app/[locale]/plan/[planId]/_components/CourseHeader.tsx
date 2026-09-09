/**
 * @component CourseHeader
 * 코스 섹션 헤더. 장소 개수 + 편집/편집 종료 토글 버튼.
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeSwap } from "@/app/_components/motion/tokens";

interface CourseHeaderProps {
  count: number;
  isEditing: boolean;
  saving: boolean;
  onEdit: () => void;
  onEditDone: () => void;
}

export default function CourseHeader({
  count,
  isEditing,
  saving,
  onEdit,
  onEditDone,
}: CourseHeaderProps) {
  const t = useTranslations("plan");

  return (
    <div className="flex h-[21px] items-center justify-between">
      <h2 className="text-[15px] font-semibold leading-[1.4] tracking-[-0.045px] text-ink">
        {t("course")} <span className="text-muted">{count}</span>
      </h2>
      <button
        type="button"
        onClick={isEditing ? onEditDone : onEdit}
        disabled={saving}
        className={`text-[12px] font-medium leading-[1.6] transition-colors motion-safe:active:enabled:scale-[0.96] ${
          isEditing ? "text-error" : "text-subtext"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={isEditing ? "done" : "edit"} {...fadeSwap}>
            {isEditing ? t("editDone") : t("edit")}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
