/**
 * @component PlanMap
 * 커밋 ①은 placeholder. 커밋 ②에서 Kakao 지도(마커·동선·bounds)로 교체하며,
 * 이 래퍼·드롭다운 위치는 유지한다.
 */
"use client";

import { motion } from "framer-motion";
import { sectionEnter } from "@/app/_components/motion/tokens";
import CourseDropdown from "./CourseDropdown";
import type { PlanPlace } from "../../_types";

interface PlanMapProps {
  places: PlanPlace[];
  selectedOrder: number | null;
  onSelectOrder: (n: number) => void;
  showDropdown: boolean;
}

export default function PlanMap({
  places,
  selectedOrder,
  onSelectOrder,
  showDropdown,
}: PlanMapProps) {
  return (
    <motion.div
      {...sectionEnter(2, true)}
      className="relative h-[196px] w-full shrink-0 overflow-hidden rounded-2xl bg-surface"
    >
      <div aria-hidden="true" className="absolute inset-0" />
      {showDropdown && (
        <CourseDropdown
          count={places.length}
          selectedOrder={selectedOrder}
          onSelect={onSelectOrder}
        />
      )}
    </motion.div>
  );
}
