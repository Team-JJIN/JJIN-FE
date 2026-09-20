/**
 * @component MissionCreatePage
 * 미션 생성 단독 페이지 껍데기 (새로고침·직접 진입 시 표시). 폼 본체는 MissionCreateForm이
 * 담당하고, 이 컴포넌트는 페이지 골격과 X 버튼(→ /mission 이동)만 책임진다.
 * store.open(추가 오버레이 열기)도 이 껍데기가 호출한다 — 단독 페이지는 인터셉트 시트와
 * 달리 퇴장 모션이 없으므로, 생성 성공 시 곧바로 store.open을 호출하고 이동한다.
 */
"use client";

import { useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useLocale } from "@/app/_components/hooks/useLocale";
import TopBarClose from "@/app/_components/ui/TopBarClose";
import MissionCreateForm from "../_components/MissionCreateForm";
import type { CreatedMissionResult } from "../_components/MissionCreateForm";
import { useMissionSheetStore } from "../_store/useMissionSheetStore";
import { sectionEnter } from "@/app/_components/motion/tokens";
import useRoutePrefetch from "@/app/_components/navigation/useRoutePrefetch";
import Spinner from "@/app/_components/ui/Spinner";

export default function MissionCreatePage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("mission.create");
  const tMission = useTranslations("mission");
  const openAddMission = useMissionSheetStore((s) => s.openAdd);
  const [isPending, startTransition] = useTransition();
  const missionHref = `/${locale}/mission`;

  useRoutePrefetch(missionHref);

  const handleClose = useCallback(() => {
    startTransition(() => router.push(missionHref));
  }, [router, missionHref, startTransition]);

  const handleDone = useCallback(
    (created?: CreatedMissionResult) => {
      if (created) openAddMission(created.id, created.preview);
      startTransition(() => router.push(missionHref));
    },
    [openAddMission, router, missionHref, startTransition],
  );

  return (
    <div className="flex h-dvh flex-col overflow-y-auto bg-white px-[20px] pb-[40px] pt-[32px]">
      <motion.div {...sectionEnter(0)} className="relative">
        <TopBarClose
          title={t("title")}
          onClose={handleClose}
          closeLabel={tMission("close")}
          disabled={isPending}
        />
        {isPending && (
          <span
            role="status"
            className="absolute right-0 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center bg-white text-muted"
          >
            <Spinner />
            <span className="sr-only">{tMission("close")}</span>
          </span>
        )}
      </motion.div>
      <motion.div {...sectionEnter(1)} className="mt-6">
        <MissionCreateForm onDone={handleDone} />
      </motion.div>
    </div>
  );
}
