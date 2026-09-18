/**
 * 일정 상세 레이아웃. 병렬 라우트 @modal(장소 검색 인터셉트) + 하단 일정|미션 토글.
 */
import ScheduleToggle from "./_components/ScheduleToggle";
import MissionSheet from "@/app/[locale]/mission/_components/MissionSheet";

export default function PlanLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
      <ScheduleToggle />
      <MissionSheet />
    </>
  );
}
