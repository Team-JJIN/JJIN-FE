/**
 * @component PlanHeader
 * 일정 상세 상단 바. TopBarClose는 자체 패딩이 없어 이 컴포넌트가 px-4 py-3 여백을 준다
 * (TopBarClose 수정 금지). 편집 중 닫기는 draft를 discard한 뒤 벗어난다.
 */
"use client";

import { useTransition } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { sectionEnter } from "@/app/_components/motion/tokens";
import { useLocale } from "@/app/_components/hooks/useLocale";
import TopBarClose from "@/app/_components/ui/TopBarClose";
import { usePlanEditStore } from "../../_store/usePlanEditStore";
import useRoutePrefetch from "@/app/_components/navigation/useRoutePrefetch";
import Spinner from "@/app/_components/ui/Spinner";

interface PlanHeaderProps {
  title: string;
  disabled?: boolean;
}

export default function PlanHeader({
  title,
  disabled = false,
}: PlanHeaderProps) {
  const t = useTranslations("plan");
  const locale = useLocale();
  const router = useRouter();
  const mode = usePlanEditStore((s) => s.mode);
  const discard = usePlanEditStore((s) => s.discard);
  const [isPending, startTransition] = useTransition();
  const homeHref = `/${locale}/home`;

  useRoutePrefetch(homeHref, !disabled);

  const handleClose = () => {
    if (disabled || usePlanEditStore.getState().saving) return;
    if (mode === "edit") discard();
    startTransition(() => router.replace(homeHref));
  };

  return (
    <motion.div {...sectionEnter(0)} className="relative px-4 py-3">
      <TopBarClose
        title={title}
        onClose={handleClose}
        disabled={disabled || isPending}
        closeLabel={t("close")}
        titleClassName="text-[19px] font-semibold leading-[1.4] text-[#171717]"
      />
      {isPending && (
        <span
          role="status"
          className="absolute right-4 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center bg-white text-muted"
        >
          <Spinner />
          <span className="sr-only">{t("close")}</span>
        </span>
      )}
    </motion.div>
  );
}
