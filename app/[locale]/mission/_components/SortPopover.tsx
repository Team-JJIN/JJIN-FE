/**
 * @component SortPopover
 * app/_components/ui/SortPopover의 미션 도메인 래퍼. 정렬 옵션·라벨·트리거 스타일만 주입한다.
 */
"use client";

import { useTranslations } from "next-intl";
import SharedSortPopover from "@/app/_components/ui/SortPopover";
import { SORT_OPTIONS } from "../_constants";
import type { MissionSort } from "@/app/_api/missions";

interface SortPopoverProps {
  sort: MissionSort;
  onChange: (sort: MissionSort) => void;
}

export default function SortPopover({ sort, onChange }: SortPopoverProps) {
  const t = useTranslations("mission");

  return (
    <SharedSortPopover
      sort={sort}
      options={SORT_OPTIONS}
      getLabel={(o) => t(`sort.${o}`)}
      onChange={onChange}
      triggerClassName="flex items-center gap-1 text-[13px] font-medium text-subtext transition duration-150 motion-safe:active:scale-[0.97]"
      showChevron
    />
  );
}
