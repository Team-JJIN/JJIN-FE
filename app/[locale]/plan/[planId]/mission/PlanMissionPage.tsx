/**
 * @component PlanMissionPage
 * 일정 상세의 미션 탭. 커밋 ①에서는 준비 중 placeholder만 표시한다.
 */
"use client";

import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { sectionEnter } from "@/app/_components/motion/tokens";
import { usePlanDetail } from "../../_hooks/usePlanQueries";
import PlanHeader from "../_components/PlanHeader";

export default function PlanMissionPage() {
  const { planId } = useParams<{ planId: string }>();
  const t = useTranslations("plan");
  const { data } = usePlanDetail(planId);

  return (
    <div className="flex h-dvh flex-col">
      <PlanHeader title={data?.name ?? ""} />
      <motion.p
        {...sectionEnter(1)}
        className="flex flex-1 items-center justify-center px-4 pb-[82px] text-center text-[15px] font-medium leading-[1.7] text-subtext"
      >
        {t("missionEmpty")}
      </motion.p>
    </div>
  );
}
