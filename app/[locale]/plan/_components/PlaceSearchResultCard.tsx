/**
 * @component PlaceSearchResultCard
 * 장소 검색 결과 카드. 썸네일 + 이름/거리/영업상태/주소 + 추가 토글 버튼.
 * 카드 자체는 탭 대상이 아니다(role 없음) — 추가/제거는 우측 버튼으로만 한다.
 * 썸네일↔텍스트열 간격은 Figma 630:2295 확인값(12px, 브리프 초안의 10px 대신 사용).
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckIcon, PlusIcon } from "@/app/_components/icons";
import { fadeSwap, listItemEnter } from "@/app/_components/motion/tokens";
import { formatDistance } from "../_lib/geo";
import type { PlaceSearchResult } from "../_types";

interface PlaceSearchResultCardProps {
  result: PlaceSearchResult;
  added: boolean;
  unavailable: boolean;
  onToggle: () => void;
  index: number;
}

export default function PlaceSearchResultCard({
  result,
  added,
  unavailable,
  onToggle,
  index,
}: PlaceSearchResultCardProps) {
  const t = useTranslations("plan");

  const status =
    result.openStatus === "UNKNOWN"
      ? null
      : t(`openStatus.${result.openStatus}`);

  return (
    <motion.div
      {...listItemEnter(index)}
      className="flex h-[85px] items-center gap-[12px] rounded-[14px] bg-white px-[10px] py-[13px] shadow-[0_2px_6px_rgba(23,23,23,0.06)]"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-[#f5f5f5]">
        {result.thumbnailUrl && (
          <img
            src={result.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex w-[146px] min-w-0 flex-col">
        <div className="flex items-end gap-2">
          <h3 className="min-w-0 truncate text-[15px] font-semibold leading-[1.4] tracking-[-0.045px] text-ink">
            {result.name}
          </h3>
          {result.distanceMeters != null && (
            <span className="shrink-0 text-[12px] leading-[1.4] text-muted">
              {formatDistance(result.distanceMeters)}
            </span>
          )}
        </div>
        {status !== null && (
          <p className="text-[12px] font-medium leading-[1.6] text-subtext">
            {result.openHours
              ? `${status} | ${result.openHours.start} - ${result.openHours.end}`
              : status}
          </p>
        )}
        <p className="truncate text-[12px] font-medium leading-[1.6] text-muted">
          {result.address}
        </p>
      </div>

      <button
        type="button"
        aria-pressed={added}
        disabled={unavailable}
        onClick={onToggle}
        aria-label={unavailable ? t("search.alreadyAdded") : undefined}
        className={`ml-auto flex shrink-0 items-center gap-1 rounded-[24px] py-[3px] pr-[14px] pl-2 text-[12px] font-bold leading-[1.6] transition-colors motion-safe:active:scale-[0.96] ${
          added ? "bg-lime-vivid text-[#0f0f0f]" : "bg-dark text-white"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={added ? "check" : "plus"}
            {...fadeSwap}
            className="flex"
          >
            {added ? <CheckIcon size={24} /> : <PlusIcon size={24} />}
          </motion.span>
        </AnimatePresence>
        <span>{unavailable ? t("search.alreadyAdded") : t("search.add")}</span>
      </button>
    </motion.div>
  );
}
