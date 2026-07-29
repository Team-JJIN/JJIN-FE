"use client";

import { useTranslations } from "next-intl";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import BigButton from "@/app/_components/ui/BigButton";
import ResetButton from "@/app/_components/ui/ResetButton";
import { SearchIcon } from "@/app/_components/icons";
import SelectChip from "@/app/_components/ui/SelectChip";
import { REGIONS } from "../_constants";

type RegionSheetProps = {
  open: boolean;
  tempRegion: string;
  setTempRegion: (r: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RegionSheet({
  open,
  tempRegion,
  setTempRegion,
  onClose,
  onConfirm,
}: RegionSheetProps) {
  const t = useTranslations("onboarding");

  return (
    <BottomSheet
      open={open}
      title={t("regionSheetTitle")}
      onClose={onClose}
      aboveFooter={
        <span className="rounded-full bg-[#F4FFD6] px-4 py-[10px] text-[12px] font-medium text-dark">
          {t("maxOneRegion")}
        </span>
      }
      footer={
        <div className="flex items-center justify-between">
          <ResetButton onClick={() => setTempRegion("")} label={t("reset")} />
          <BigButton
            disabled={!tempRegion}
            onClick={onConfirm}
            className="w-[164px] rounded-[16px]"
          >
            {t("selectComplete")}
          </BigButton>
        </div>
      }
    >
      <div className="mt-[5px] flex items-center h-[44px] rounded-[14px] bg-surface px-3">
        <input
          placeholder={t("searchPlaceholder")}
          className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-[#C4C4C4]"
          readOnly
          aria-label={t("searchPlaceholder")}
        />
        <SearchIcon className="text-[#C4C4C4]" />
      </div>

      <p className="mt-6 text-[13px] font-medium text-dark mb-3">{t("popularDestinations")}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t("popularDestinations")}>
        {REGIONS.map((r) => (
          <SelectChip
            key={r}
            label={t(`regions.${r}`)}
            selected={tempRegion === r}
            onToggle={() => setTempRegion(r === tempRegion ? "" : r)}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
