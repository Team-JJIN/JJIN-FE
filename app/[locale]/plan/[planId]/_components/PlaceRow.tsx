/**
 * @component PlaceRow
 * 타임라인 셀 + 장소 카드 한 행. Reorder.Item으로 감싸 편집 모드에서 드래그 재정렬을 지원한다.
 * 읽기 모드에서도 Reorder.Item을 유지해야(dragListener false로 드래그만 막음) variant 전환 시
 * 카드가 리마운트되지 않고 실제 height 트윈으로 자연스럽게 늘어난다(PlaceCard).
 */
"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  dragLift,
  fadeSwap,
  layoutShift,
  listItemEnter,
} from "@/app/_components/motion/tokens";
import PlaceTimelineCell from "./PlaceTimelineCell";
import PlaceCard from "./PlaceCard";
import type { PlanPlace, PlaceCardVariant } from "../../_types";

interface PlaceRowProps {
  place: PlanPlace;
  index: number;
  isLast: boolean;
  distanceToNext: number | null;
  variant: PlaceCardVariant;
  onDelete: (id: string) => void;
  onDirections: (place: PlanPlace) => void;
  onToggleSelect: () => void;
}

export default function PlaceRow({
  place,
  index,
  isLast,
  distanceToNext,
  variant,
  onDelete,
  onDirections,
  onToggleSelect,
}: PlaceRowProps) {
  const controls = useDragControls();
  const enter = listItemEnter(index);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      as="div"
      value={place}
      dragListener={false}
      dragControls={controls}
      whileDrag={dragLift}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      initial={enter.initial}
      // scale: 1을 명시해 드래그 lift(1.02)가 끝나면 돌아갈 값을 고정한다.
      animate={{ ...enter.animate, scale: 1 }}
      transition={{ ...enter.transition, layout: layoutShift }}
      exit={fadeSwap.exit}
      data-order={place.order}
      className="flex items-stretch gap-6"
    >
      <PlaceTimelineCell
        order={place.order}
        distanceMeters={distanceToNext}
        isLast={isLast}
      />
      <PlaceCard
        place={place}
        variant={variant}
        dragControls={variant === "edit" ? controls : undefined}
        isDragging={isDragging}
        onDelete={onDelete}
        onDirections={onDirections}
        onToggleSelect={onToggleSelect}
      />
    </Reorder.Item>
  );
}
