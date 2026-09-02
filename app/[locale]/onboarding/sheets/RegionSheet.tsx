"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import BigButton from "@/app/_components/ui/BigButton";
import ResetButton from "@/app/_components/ui/ResetButton";
import SelectChip from "@/app/_components/ui/SelectChip";
import { SearchIcon } from "@/app/_components/icons";
import { searchRegions } from "@/app/_api/onboarding";
import { POPULAR_REGIONS } from "../_constants";
import { useRegionLabel } from "../_useRegionLabel";

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
  const regionLabel = useRegionLabel();

  const [keyword, setKeyword] = useState("");
  const [debounced, setDebounced] = useState("");

  // 시트를 닫을 때 검색어 초기화
  useEffect(() => {
    if (!open) {
      setKeyword("");
      setDebounced("");
    }
  }, [open]);

  // 입력 디바운스 (250ms)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(keyword.trim()), 250);
    return () => clearTimeout(id);
  }, [keyword]);

  const { data: regions = [], isFetching, isError } = useQuery({
    queryKey: ["onboarding", "regions", debounced],
    queryFn: () => searchRegions(debounced),
    enabled: open && debounced.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: false,
  });

  const hasKeyword = debounced.length > 0;
  const showEmpty = hasKeyword && !isFetching && !isError && regions.length === 0;

  const toggleRegion = (name: string) =>
    setTempRegion(tempRegion === name ? "" : name);

  return (
    <BottomSheet
      open={open}
      title={t("regionSheetTitle")}
      titleClassName="text-[19px] font-semibold text-[#171717]"
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
      {/* 제목과 검색창 사이 35px (헤더 pb-16px + mt-19px = 35px) */}
      <div className="mt-[19px] flex items-center h-[44px] rounded-[14px] bg-[#F7F7F7] px-3">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 bg-transparent text-[14px] font-medium text-dark outline-none placeholder:text-[#C4C4C4]"
          aria-label={t("searchPlaceholder")}
        />
        <SearchIcon className="text-[#9B9B9B]" />
      </div>

      {hasKeyword ? (
        /* 검색 결과: 성공 시 지역 뱃지로 선택, 결과 없으면 안내 */
        <div className="mt-6">
          {isError ? (
            <p className="text-[13px] text-error">{t("errorRegionSearchFailed")}</p>
          ) : showEmpty ? (
            <p className="text-[13px] text-[#9B9B9B]">{t("noRegionResults")}</p>
          ) : (
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("searchPlaceholder")}>
              {regions.map((region) => (
                <SelectChip
                  key={region.id}
                  label={regionLabel(region.displayName)}
                  selected={tempRegion === region.displayName}
                  onToggle={() => toggleRegion(region.displayName)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* 검색어가 없을 때: 인기 여행지 목록 (제목-버튼 위아래 20px 간격) */
        <>
          <p className="mt-[20px] mb-[20px] text-[13px] font-medium text-dark">
            {t("popularDestinations")}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("popularDestinations")}>
            {POPULAR_REGIONS.map((name) => (
              <SelectChip
                key={name}
                label={regionLabel(name)}
                selected={tempRegion === name}
                onToggle={() => toggleRegion(name)}
              />
            ))}
          </div>
        </>
      )}
    </BottomSheet>
  );
}
