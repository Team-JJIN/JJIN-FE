/**
 * @component MissionOverlayHost
 * 미션 도메인 전역 오버레이 호스트. useMissionSheetStore 상태에 따라 상세/추가 통합
 * 바텀시트(MissionSheet)를 렌더링한다.
 */
"use client";

import MissionSheet from "./MissionSheet";

export default function MissionOverlayHost() {
  return <MissionSheet />;
}
