"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SelectChip from "@/app/_components/ui/SelectChip";
import { SUB_CATEGORIES } from "../_constants";

type Step3ContentProps = {
  categories: string[];
  subCategories: string[];
  toggleSubCategory: (sub: string) => void;
  t: (key: string) => string;
};

export default function Step3Content({
  categories,
  subCategories,
  toggleSubCategory,
  t,
}: Step3ContentProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (cat: string) => {
    setCollapsed((c) => ({ ...c, [cat]: !c[cat] }));
  };

  return (
    <>
      <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">{t("step3Title")}</h1>
      <p className="mt-[7px] text-[14px] font-medium text-[#737373]">{t("step3Subtitle")}</p>

      <div className="flex flex-col gap-[12px] mt-[30px]">
        {categories.map((cat) => (
          <div
            key={cat}
            className="rounded-[12px] bg-white px-[12px] py-[10px] shadow-[0px_2px_12px_0px_rgba(23,23,23,0.06)]"
          >
            <button
              type="button"
              onClick={() => toggle(cat)}
              className="flex w-full items-center justify-between"
            >
              <span className="text-[13px] font-semibold text-dark">{t(`categories.${cat}`)}</span>
              <span className={`text-[12px] text-[#C4C4C4] transition-transform ${collapsed[cat] ? "rotate-180" : ""}`}>▼</span>
            </button>
            {!collapsed[cat] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-[8px] mt-[8px]">
                  {(SUB_CATEGORIES[cat] ?? []).map((sub) => (
                    <SelectChip
                      key={sub}
                      label={sub}
                      selected={subCategories.includes(sub)}
                      onToggle={() => toggleSubCategory(sub)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
