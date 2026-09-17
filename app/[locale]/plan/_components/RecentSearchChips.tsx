/**
 * @component RecentSearchChips
 * 장소 검색 최근 검색어 칩 목록. 탭하면 그 키워드로 바로 검색한다. X(삭제) 버튼 없음(Figma 그대로).
 */
"use client";

import { useTranslations } from "next-intl";

interface RecentSearchChipsProps {
  items: string[];
  onSelect: (keyword: string) => void;
}

export default function RecentSearchChips({
  items,
  onSelect,
}: RecentSearchChipsProps) {
  const t = useTranslations("plan");

  return (
    <div className="flex flex-col gap-[6px] px-[17px]">
      <p className="text-[14px] font-medium leading-[1.6] text-ink">
        {t("search.recent")}
      </p>
      <div className="flex flex-wrap gap-[15px]">
        {items.map((keyword) => (
          <button
            key={keyword}
            type="button"
            onClick={() => onSelect(keyword)}
            className="h-[27px] rounded-full bg-surface px-3 py-1 text-[12px] font-medium leading-[1.6] text-subtext transition-colors motion-safe:active:scale-[0.96]"
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
}
