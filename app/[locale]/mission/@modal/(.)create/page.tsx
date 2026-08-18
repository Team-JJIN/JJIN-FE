/**
 * 미션 생성 인터셉팅 라우트 (바텀시트) 껍데기. 폼 본체는 MissionCreateForm이 담당하고,
 * 이 컴포넌트는 시트 열림/닫힘 모션과 라우팅(뒤로가기)만 책임진다.
 * store.open(추가 오버레이 열기)도 이 껍데기가 호출한다 — 생성 시트의 퇴장 모션(300ms)이
 * 끝나기 전에 추가 오버레이 딤이 겹쳐 뜨는 것을 막기 위해, 생성 성공 시 미션을 ref에
 * 잠시 보관해 뒀다가 exit 모션이 끝난 뒤(onExitComplete)에야 store.open을 호출한다.
 */
"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import MissionCreateForm from "../../_components/MissionCreateForm";
import { useAddMissionStore } from "../../_store/useAddMissionStore";
import type { Mission } from "@/app/_api/missions";

export default function InterceptedMissionCreatePage() {
  const router = useRouter();
  const t = useTranslations("mission.create");
  const tMission = useTranslations("mission");
  const openAddMission = useAddMissionStore((s) => s.open);

  // X·성공 시 open을 먼저 false로 내려 하강 모션을 재생하고,
  // 모션이 끝난 뒤(onExitComplete)에 실제로 이전 화면으로 돌아간다.
  const [open, setOpen] = useState(true);
  // 생성 성공 시 전달된 미션을 잠시 보관한다. exit 모션이 끝난 뒤 store.open에 사용된다.
  const createdMissionRef = useRef<Mission | undefined>(undefined);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleDone = useCallback((created?: Mission) => {
    createdMissionRef.current = created;
    setOpen(false);
  }, []);

  const handleExitComplete = useCallback(() => {
    if (createdMissionRef.current) {
      openAddMission(createdMissionRef.current);
    }
    router.back();
  }, [router, openAddMission]);

  return (
    <BottomSheet
      open={open}
      title={t("title")}
      onClose={handleClose}
      closeLabel={tMission("close")}
      onExitComplete={handleExitComplete}
      animated
    >
      <MissionCreateForm onDone={handleDone} />
    </BottomSheet>
  );
}
