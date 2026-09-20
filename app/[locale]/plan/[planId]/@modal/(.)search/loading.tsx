"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useFocusTrap } from "@/app/_components/hooks/useFocusTrap";
import ScreenPreparation from "@/app/_components/loading/ScreenPreparation";
import TopBarClose from "@/app/_components/ui/TopBarClose";

export default function Loading() {
  const router = useRouter();
  const t = useTranslations("plan");
  const panelRef = useFocusTrap(true);
  const handleClose = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose]);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={t("search.title")}
      className="absolute inset-0 z-50 flex flex-col bg-white"
    >
      <div className="px-4 py-3">
        <TopBarClose
          title={t("search.title")}
          onClose={handleClose}
          closeLabel={t("close")}
          titleClassName="text-[19px] font-semibold leading-[1.4] text-[#171717]"
        />
      </div>
      <ScreenPreparation className="min-h-0 flex-1" />
    </div>
  );
}
