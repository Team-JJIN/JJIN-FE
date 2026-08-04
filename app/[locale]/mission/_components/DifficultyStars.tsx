/**
 * @component DifficultyStars
 * 미션 난이도(1~3)를 별 아이콘으로 보여주는 정보 표시 전용 컴포넌트. 인터랙션 없음.
 */
"use client";

import { useTranslations } from "next-intl";
import { StarIcon } from "@/app/_components/icons";
import type { MissionDifficulty } from "@/app/_api/missions";

interface DifficultyStarsProps {
  difficulty: MissionDifficulty;
  className?: string;
}

export default function DifficultyStars({
  difficulty,
  className,
}: DifficultyStarsProps) {
  const t = useTranslations("mission");

  return (
    <div
      role="img"
      aria-label={t("difficultyValue", { level: difficulty })}
      className={`flex items-center gap-[2px] ${className ?? ""}`}
    >
      <span className="text-[14px] font-medium text-muted">
        {t("difficultyLabel")}
      </span>
      <div className="flex items-center -space-x-1" aria-hidden="true">
        {Array.from({ length: difficulty }).map((_, i) => (
          <StarIcon key={i} size={16} className="text-muted" />
        ))}
      </div>
    </div>
  );
}
