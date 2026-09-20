/**
 * @component PlaceList
 * 장소 목록. 드래그 재정렬(Reorder.Group), 삭제 시 형제 layout 이동, 코스 선택 시 해당 행으로
 * 스크롤을 담당한다.
 */
"use client";

import { useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  Reorder,
  useReducedMotion,
} from "framer-motion";
import { fadeSwap } from "@/app/_components/motion/tokens";
import { haversineMeters } from "../../_lib/geo";
import PlaceRow from "./PlaceRow";
import AddPlaceButton from "./AddPlaceButton";
import type { PlanPlace } from "../../_types";

interface PlaceListProps {
  places: PlanPlace[];
  isEditing: boolean;
  saving: boolean;
  selectedOrder: number | null;
  onReorder: (next: PlanPlace[]) => void;
  onDelete: (id: string) => void;
  onDirections: (place: PlanPlace) => void;
  onToggleSelect: (order: number) => void;
  onAddPlace: () => void;
  addPlacePending?: boolean;
}

export default function PlaceList({
  places,
  isEditing,
  saving,
  selectedOrder,
  onReorder,
  onDelete,
  onDirections,
  onToggleSelect,
  onAddPlace,
  addPlacePending = false,
}: PlaceListProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (selectedOrder === null) return;
    const row = rootRef.current?.querySelector(
      `[data-order="${selectedOrder}"]`,
    );
    row?.scrollIntoView({
      block: "nearest",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [selectedOrder, reducedMotion]);

  return (
    <Reorder.Group
      as="div"
      inert={saving}
      ref={rootRef}
      axis="y"
      values={places}
      onReorder={onReorder}
      className="relative flex flex-col gap-[19px]"
    >
      <AnimatePresence initial={false}>
        {places.map((p, i) => (
          <PlaceRow
            key={p.id}
            place={p}
            index={i}
            isLast={i === places.length - 1}
            distanceToNext={
              i < places.length - 1 ? haversineMeters(p, places[i + 1]) : null
            }
            variant={
              isEditing
                ? "edit"
                : p.order === selectedOrder
                  ? "selected"
                  : "read"
            }
            onDelete={onDelete}
            onDirections={onDirections}
            onToggleSelect={() => onToggleSelect(p.order)}
          />
        ))}
        {(isEditing || places.length === 0) && (
          <motion.div
            key="add"
            {...fadeSwap}
            className={places.length > 0 ? "ml-[49px]" : undefined}
          >
            <AddPlaceButton onClick={onAddPlace} pending={addPlacePending} />
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Group>
  );
}
