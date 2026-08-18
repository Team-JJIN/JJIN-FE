/**
 * 미션 도메인 레이아웃. 병렬 라우트(@modal)와 전역 오버레이 호스트를 함께 렌더링한다.
 */
import MissionOverlayHost from "./_components/MissionOverlayHost";

export default function MissionLayout({
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
      <MissionOverlayHost />
    </>
  );
}
