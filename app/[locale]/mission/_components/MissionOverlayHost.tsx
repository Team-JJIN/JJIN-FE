/**
 * @component MissionOverlayHost
 * 미션 도메인 전역 오버레이 호스트. useAddMissionStore 상태에 따라 오버레이를 렌더링한다.
 */
"use client";

import AddMissionOverlay from "./AddMissionOverlay";

export default function MissionOverlayHost() {
  return <AddMissionOverlay />;
}
