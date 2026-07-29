"use client";

import SelectChip from "@/app/_components/ui/SelectChip";
import { CATEGORIES } from "../_constants";
import type { OnboardingData, Category } from "../_types";

type Step2ContentProps = {
  data: OnboardingData;
  toggleCategory: (cat: Category) => void;
  t: (key: string) => string;
};

export default function Step2Content({ data, toggleCategory, t }: Step2ContentProps) {
  return (
    <>
      <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">{t("step2Title")}</h1>
      <p className="mt-[7px] text-[14px] font-medium text-[#737373]">{t("step2Subtitle")}</p>

      <div className="flex flex-wrap gap-[10px] mt-[26px]" role="group" aria-label={t("step2Title")}>
        {CATEGORIES.map((cat) => (
          <SelectChip
            key={cat}
            label={t(`categories.${cat}`)}
            selected={data.categories.includes(cat)}
            onToggle={() => toggleCategory(cat)}
          />
        ))}
      </div>

      {/* 안내 칩 */}
      <div className="flex-1" />
    </>
  );
}
