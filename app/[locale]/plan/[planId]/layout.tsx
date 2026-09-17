/**
 * 일정 상세 레이아웃. 병렬 라우트 @modal(장소 검색 인터셉트) + 하단 일정|미션 토글.
 */
import ScheduleToggle from "./_components/ScheduleToggle";

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
    </>
  );
}
