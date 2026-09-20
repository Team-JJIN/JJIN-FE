/**
 * @component HomePage
 * 홈(일정 목록) 페이지. 상단 "일정" 제목 + 추가 버튼, 일정 카드 목록.
 * 목록이 비어 있으면 빈 상태(JJ 로고 + 안내 문구)를 보여준다.
 * - 추가 버튼: 일정 생성(온보딩) 화면으로 이동
 * - 카드 클릭: 일정 상세(/plan/[planId])로 이동, 삭제 아이콘: 확인 다이얼로그 후 DELETE
 * - 등장 애니메이션은 미션 탭과 동일하게 sectionEnter/listItemEnter 사용
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { PlusIcon } from "@/app/_components/icons";
import {
  sectionEnter,
  listItemEnter,
  TAP,
} from "@/app/_components/motion/tokens";
import Dialog from "@/app/_components/ui/Dialog";
import NavigationLink from "@/app/_components/navigation/NavigationLink";
import { HomeSkeleton } from "@/app/_components/loading/PageSkeletons";
import { deleteTravelPlan, type Plan } from "@/app/_api/plans";
import { usePlans, planKeys } from "@/app/[locale]/plan/_hooks/usePlanQueries";
import { getApiErrorMessage } from "@/app/_api/client";

// "2026-07-22" -> "26.07.22"
function formatDot(date: string) {
  const [y, m, d] = date.split("-");
  return `${y.slice(2)}.${m}.${d}`;
}

export default function HomePage() {
  const t = useTranslations("home");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, isError, refetch } = usePlans();
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (planId: string) => deleteTravelPlan(planId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: planKeys.list() }),
    onError: (err) => alert(getApiErrorMessage(err, t("errorDeleteFailed"))),
    onSettled: () => setDeleteTarget(null),
  });

  const hasPlans = plans.length > 0;
  const showLoading = isLoading && !hasPlans;
  const showError = isError && !hasPlans;
  const isEmpty = !showLoading && !showError && !hasPlans;

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 헤더: 제목 + 추가 버튼 */}
      <motion.div
        {...sectionEnter(0)}
        className="flex items-center justify-between pt-[32px] pb-4"
      >
        <h1 className="text-[19px] font-semibold tracking-[-0.095px] text-dark">
          {t("title")}
        </h1>
        <NavigationLink
          href={`/${locale}/onboarding`}
          aria-label={t("addPlan")}
          className="transition duration-150 motion-safe:active:scale-90"
        >
          <PlusIcon />
        </NavigationLink>
      </motion.div>

      {showLoading ? (
        <HomeSkeleton contentOnly />
      ) : showError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 pb-[80px]">
          <p className="text-[13px] font-medium text-subtext">
            {t("errorLoad")}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.97]"
          >
            {t("retry")}
          </button>
        </div>
      ) : isEmpty ? (
        /* 빈 상태: JJ 로고 + 안내 문구 (화면 중앙) */
        <motion.div
          {...sectionEnter(1)}
          className="flex flex-1 flex-col items-center justify-center pb-[80px]"
        >
          <Image
            src="/image/JJ.png"
            alt=""
            width={111}
            height={111}
            className="h-[111px] w-[111px] object-contain"
          />
          <p className="mt-[9px] text-[17px] font-semibold text-ink">
            {t("emptyTitle")}
          </p>
          <p className="mt-[9px] whitespace-pre-line text-center text-[14px] font-medium text-subtext">
            {t("emptyDescription")}
          </p>
        </motion.div>
      ) : (
        /* 일정 카드 목록 — "일정" 제목에서 25px 아래(헤더 pb-16 + mt-9 = 25px) */
        <div className="-mx-[20px] mt-[9px] flex-1 overflow-y-auto px-[20px] pb-[96px]">
          <div className="flex flex-col gap-[14px]">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                index={i}
                plan={plan}
                dateRange={`${formatDot(plan.startDate)} – ${formatDot(plan.endDate)}`}
                transport={t(`transportModes.${plan.transportMode}`)}
                categories={plan.interestCategories
                  .map((c) => t(`contentTypes.${c}`))
                  .join(" · ")}
                nightsLabel={t("nights", {
                  nights: plan.nights,
                  days: plan.dayCount,
                })}
                deleteLabel={t("deletePlan")}
                href={`/${locale}/plan/${plan.id}`}
                onDelete={() => setDeleteTarget(plan)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 일정 삭제 확인 다이얼로그 */}
      <Dialog
        open={!!deleteTarget}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        cancelLabel={t("deleteCancel")}
        confirmLabel={t("deleteConfirm")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}

function PlanCard({
  index,
  plan,
  dateRange,
  transport,
  categories,
  nightsLabel,
  deleteLabel,
  href,
  onDelete,
}: {
  index: number;
  plan: Plan;
  dateRange: string;
  transport: string;
  categories: string;
  nightsLabel: string;
  deleteLabel: string;
  href: string;
  onDelete: () => void;
}) {
  return (
    <motion.div
      {...listItemEnter(index)}
      whileHover={{ scale: 1.01 }}
      whileTap={TAP.card}
      className="relative rounded-[16px] bg-white shadow-[0px_2px_12px_0px_rgba(23,23,23,0.06)]"
    >
      <Link href={href} className="block cursor-pointer py-[14px]">
        <div className="flex items-start px-[15px] pr-12">
          <h2 className="text-[17px] font-semibold text-ink">{plan.name}</h2>
        </div>

        <p className="mt-[6px] px-[15px] text-[14px] font-medium text-subtext">
          {dateRange}
        </p>
        <p className="mt-[2px] px-[15px] text-[14px] font-medium text-subtext">
          {transport}
        </p>
        {categories && (
          <p className="mt-[2px] px-[15px] text-[14px] font-medium text-subtext">
            {categories}
          </p>
        )}

        <div className="mt-[9px] mx-[15px] h-px bg-line" />

        <div className="mt-[14px] flex items-center justify-between px-[15px]">
          <span className="rounded-full border-[1.5px] border-lime-vivid bg-lime-pale px-3 py-[5px] text-[12px] font-medium text-[#8C8C8C]">
            {plan.experienceLevel}
          </span>
          <span className="text-[12px] font-normal text-[#8C8C8C]">
            {nightsLabel}
          </span>
        </div>
      </Link>
      <button
        type="button"
        onClick={onDelete}
        aria-label={deleteLabel}
        className="absolute right-[15px] top-[14px] z-10 shrink-0 transition duration-150 motion-safe:active:scale-90"
      >
        <Image
          src="/image/TrashIcon.png"
          alt=""
          width={16}
          height={18}
          className="h-[18px] w-[16px] object-contain"
        />
      </button>
    </motion.div>
  );
}
