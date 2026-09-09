/**
 * @page (인터셉트) plan/[planId]/search
 * 편집 모드의 '+ 장소 추가'로만 열리는 우측 슬라이드 패널. beginEdit을 호출하지 않는다
 * (스토어는 이미 edit 모드). X → open=false → exit 모션 후 router.back();
 * 드래프트는 스토어에 그대로 남아 편집 모드로 복귀한다.
 */
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import TopBarClose from "@/app/_components/ui/TopBarClose";
import { slideOver } from "@/app/_components/motion/tokens";
import PlaceSearchPanel from "../../../_components/PlaceSearchPanel";

/** 실제 패널. useIsPresent + inert로 exit 모션 중 포커스·탭을 막는다 (BottomSheet의 useIsPresent 관례, MissionSheet StepPane 참고). */
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const t = useTranslations("plan");
  const isPresent = useIsPresent();

  return (
    <motion.div
      {...slideOver}
      inert={!isPresent}
      role="dialog"
      aria-modal="true"
      aria-label={t("search.title")}
      className="absolute inset-0 z-50 flex flex-col bg-white"
    >
      {/* PlanHeader.tsx(P2)와 동일한 헤더(px-4 py-3 + titleClassName 19px) — 상세 헤더와 전환 시 크기가
          튀지 않도록 두 화면이 같은 값을 쓴다(review-1 M3 수정). */}
      <div className="px-4 py-3">
        <TopBarClose
          title={t("search.title")}
          onClose={onClose}
          closeLabel={t("close")}
          titleClassName="text-[19px] font-semibold leading-[1.4] text-[#171717]"
        />
      </div>
      <PlaceSearchPanel />
    </motion.div>
  );
}

export default function InterceptedPlaceSearchPage() {
  const router = useRouter();
  // 인터셉트 경로는 스토어 draft만 쓰므로 day 쿼리 파라미터를 소비하지 않는다(review-1 n1).

  const [open, setOpen] = useState(true);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <AnimatePresence onExitComplete={() => router.back()}>
      {open && <SearchOverlay key="search-overlay" onClose={handleClose} />}
    </AnimatePresence>
  );
}
