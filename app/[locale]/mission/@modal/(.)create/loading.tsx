"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ScreenPreparation from "@/app/_components/loading/ScreenPreparation";
import BottomSheet from "@/app/_components/ui/BottomSheet";

export default function Loading() {
  const router = useRouter();
  const t = useTranslations("mission.create");
  const tMission = useTranslations("mission");

  return (
    <BottomSheet
      open
      title={t("title")}
      onClose={() => router.back()}
      closeLabel={tMission("close")}
    >
      <ScreenPreparation className="min-h-[240px]" />
    </BottomSheet>
  );
}
