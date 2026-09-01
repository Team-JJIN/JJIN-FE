/**
 * @component MissionOverlayHost
 * 미션 도메인 전역 오버레이 호스트. 상세/추가 통합 바텀시트(MissionSheet)와
 * 피드 댓글 바텀시트(CommentSheet)를 렌더링한다. 각 시트는 자기 스토어의 open을 본다.
 */
"use client";

import MissionSheet from "./MissionSheet";
import CommentSheet from "./CommentSheet";

export default function MissionOverlayHost() {
  return (
    <>
      <MissionSheet />
      <CommentSheet />
    </>
  );
}
