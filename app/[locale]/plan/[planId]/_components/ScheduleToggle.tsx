/**
 * @component ScheduleToggle
 * 일정 상세 하단 일정|미션 탭 전환. 검색 인터셉트 라우트(/search) 위에서는 숨긴다.
 * Figma 845:2703 실측 353×46(스크린 375 기준 좌우 11) → 브리프 기본값 px-5 대신 px-[11px] 사용.
 */
"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { tabIndicator } from "@/app/_components/motion/tokens";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { usePlanEditStore } from "../../_store/usePlanEditStore";

export default function ScheduleToggle() {
  const t = useTranslations("plan");
  const pathname = usePathname();
  const { planId } = useParams<{ planId: string }>();
  const locale = useLocale();
  const router = useRouter();
  const saving = usePlanEditStore((s) => s.saving);

  if (pathname.endsWith("/search")) return null;

  const active: "schedule" | "mission" = pathname.endsWith("/mission")
    ? "mission"
    : "schedule";

  const goTo = (tab: "schedule" | "mission") => {
    if (tab === active || usePlanEditStore.getState().saving) return;
    router.push(
      tab === "schedule"
        ? `/${locale}/plan/${planId}`
        : `/${locale}/plan/${planId}/mission`,
    );
  };

  return (
    <nav
      aria-label={`${t("tabSchedule")}/${t("tabMission")}`}
      className="absolute inset-x-0 bottom-0 z-10 px-[11px] py-[18px] bg-[linear-gradient(to_top,#fafafa_55%,transparent)]"
    >
      <div className="relative flex h-[46px] rounded-full bg-white p-1 shadow-[0_2px_6px_rgba(23,23,23,0.06)]">
        {(["schedule", "mission"] as const).map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => goTo(tab)}
              disabled={saving}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex-1 rounded-full text-[15px] font-semibold leading-[1.4] transition-colors ${
                isActive ? "text-white" : "text-subtext"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="plan-toggle-pill"
                  transition={tabIndicator}
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-dark"
                />
              )}
              <span className="relative z-10">
                {tab === "schedule" ? t("tabSchedule") : t("tabMission")}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
