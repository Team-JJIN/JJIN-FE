/**
 * @component PlaceSortPopover
 * app/_components/ui/SortPopover의 일정 도메인 래퍼. 정렬 옵션·라벨·트리거 스타일만 주입한다.
 */
"use client";

import { useTranslations } from "next-intl";
import SharedSortPopover from "@/app/_components/ui/SortPopover";
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

  return (
    <SharedSortPopover
      sort={sort}
      options={PLACE_SORT_OPTIONS}
      getLabel={(o) => t(`search.sort.${o}`)}
      onChange={onChange}
      triggerClassName="text-[12px] font-medium leading-[1.6] text-subtext transition duration-150 motion-safe:active:scale-[0.97]"
      triggerAriaLabel={t("search.sortLabel")}
    />
  );
}
