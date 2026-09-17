/**
 * @component PlaceTimelineCell
 * 장소 카드 왼쪽 타임라인 셀. 번호원 + (마지막이 아니면) 세로 점선과 다음 장소까지의 거리.
 * 행 높이는 카드가 실제 height로 트윈하므로(PlaceCard) 점선은 flex stretch만으로 따라 늘어난다 —
 * layout 애니메이션(scale)이 없어 원이 찌그러질 일이 없다.
 */
"use client";

import { formatDistance } from "../../_lib/geo";

interface PlaceTimelineCellProps {
  order: number;
  distanceMeters: number | null;
  isLast: boolean;
}

export default function PlaceTimelineCell({
  order,
  distanceMeters,
  isLast,
}: PlaceTimelineCellProps) {
  return (
    <div className="flex w-[25px] shrink-0 flex-col items-center">
      <div
        aria-hidden="true"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f0f0f] text-[15px] font-semibold leading-[1.4] text-white"
      >
        {order}
      </div>
      {!isLast && (
        <>
          <div className="my-1 w-0 flex-1 border-l border-dashed border-[#aeb0b6]" />
          {distanceMeters !== null && (
            <span className="text-[10px] font-normal leading-[1.4] text-muted">
              {formatDistance(distanceMeters)}
            </span>
          )}
        </>
      )}
    </div>
  );
}
