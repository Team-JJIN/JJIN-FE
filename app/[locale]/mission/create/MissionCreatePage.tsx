/**
 * @component MissionCreatePage
 * 미션 생성 단독 페이지 껍데기 (새로고침·직접 진입 시 표시). 폼 본체는 MissionCreateForm이
 * 담당하고, 이 컴포넌트는 페이지 골격과 X 버튼(→ /mission 이동)만 책임진다.
 * store.open(추가 오버레이 열기)도 이 껍데기가 호출한다 — 단독 페이지는 인터셉트 시트와
 * 달리 퇴장 모션이 없으므로, 생성 성공 시 곧바로 store.open을 호출하고 이동한다.
 */
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useLocale } from "@/app/_components/hooks/useLocale";
import TopBarClose from "@/app/_components/ui/TopBarClose";
import MissionCreateForm from "../_components/MissionCreateForm";
import { useAddMissionStore } from "../_store/useAddMissionStore";
import { sectionEnter } from "@/app/_components/motion/tokens";
import type { Mission } from "@/app/_api/missions";

export default function MissionCreatePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("mission.create");
  const tMission = useTranslations("mission");
  const openAddMission = useAddMissionStore((s) => s.open);

  const handleClose = useCallback(() => {
    router.push(`/${locale}/mission`);
  }, [router, locale]);

  const handleDone = useCallback(
    (created?: Mission) => {
      if (created) openAddMission(created);
      router.push(`/${locale}/mission`);
    },
    [openAddMission, router, locale],
  );

  return (
    <div className="flex h-dvh flex-col overflow-y-auto bg-white px-[20px] pb-[40px] pt-[32px]">
      <motion.div {...sectionEnter(0)}>
        <TopBarClose
          title={t("title")}
          onClose={handleClose}
          closeLabel={tMission("close")}
        />
      </motion.div>
      <motion.div {...sectionEnter(1)} className="mt-6">
        <MissionCreateForm onDone={handleDone} />
      </motion.div>
    </div>
  );
}
