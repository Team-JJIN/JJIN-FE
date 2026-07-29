"use client";

import { LEVELS } from "../_constants";
import type { OnboardingData, Level } from "../_types";

type Step4ContentProps = {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  t: (key: string) => string;
};

export default function Step4Content({ data, setData, t }: Step4ContentProps) {
  return (
    <>
      <h1 className="text-[22px] font-bold tracking-[-0.5px] text-dark">{t("step4Title")}</h1>
      <p className="mt-[7px] text-[14px] font-medium text-[#737373]">{t("step4Subtitle")}</p>

      <div className="flex flex-col gap-[16px] mt-[30px]" role="radiogroup" aria-label={t("step4Title")}>
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            type="button"
            role="radio"
            aria-checked={data.level === lvl}
            onClick={() => setData((d) => ({ ...d, level: lvl as Level }))}
            className={`w-full rounded-[16px] p-[12px] text-left transition-colors ${
              data.level === lvl
                ? "bg-[#F4FFD6] border-[1.5px] border-[#CCFF00]"
                : "bg-white border-[1.5px] border-transparent shadow-[0px_2px_12px_0px_rgba(23,23,23,0.06)]"
            }`}
          >
            <span className="text-[15px] font-semibold tracking-[-0.3%] text-[#111111]">
              {t(lvl)}
            </span>
            <span className="block mt-[6px] text-[12px] font-medium text-[#C4C4C4]">
              {t(`${lvl}Desc`)}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
