/**
 * @store useMissionSheetStore
 * 미션 상세/추가 통합 바텀시트(MissionSheet)의 상태.
 * open이 시트 열림 여부이고, step이 시트 안에서 보여줄 화면이다.
 * entry는 "이번에 시트를 어디로 열었는가"를 기억해, 상세 → 추가로 들어온 경우에만
 * 추가 화면 헤더에 ←(뒤로)를 노출하는 데 쓴다. 카드의 +로 곧장 추가 화면을 연 경우엔
 * 돌아갈 상세가 없으므로 ←를 띄우지 않는다.
 *
 * open을 mission의 null 여부와 분리한 이유: 닫힘 exit 모션(300ms) 동안에도 콘텐츠를
 * 그려야 하므로 close()가 mission을 지우면 안 된다. 대신 openSeq를 열 때마다 올려서
 * MissionSheet가 매 오픈마다 콘텐츠를 새로 마운트하게 한다 — exit 도중 같은 미션을
 * 다시 열어도 이전 오픈의 로컬 선택 상태(AddMissionPanel)가 살아남지 않는다.
 */
"use client";

import { create } from "zustand";
import type { Mission } from "@/app/_api/missions";

export type MissionSheetStep = "detail" | "add";

interface MissionSheetState {
  /** 시트 열림 여부 */
  open: boolean;
  /** 시트에 표시할 미션. close() 후에도 마지막 값을 유지한다 (exit 모션 중 콘텐츠 보존) */
  mission: Mission | null;
  /** 열 때마다 +1. MissionSheet가 key에 섞어 오픈 단위로 콘텐츠를 리마운트한다 */
  openSeq: number;
  /** 현재 보여줄 화면 */
  step: MissionSheetStep;
  /** 이번에 처음 연 화면 (detail로 들어왔을 때만 add에서 ← 노출) */
  entry: MissionSheetStep;
  /** 카드 이미지 탭 → 상세부터 시작 */
  openDetail: (mission: Mission) => void;
  /** 카드 + 탭 / 미션 생성 직후 → 추가 화면부터 시작 (← 없음) */
  openAdd: (mission: Mission) => void;
  /** 상세 안의 '+ 추가' → 오른쪽에서 추가 화면 슬라이드 인 */
  goToAdd: () => void;
  /** 추가 화면의 ← → 왼쪽으로 상세 슬라이드 백 */
  goBackToDetail: () => void;
  /**
   * 시트 닫기. open만 내리고 mission/step/entry는 일부러 유지한다 —
   * 시트가 아래로 내려가는 exit 모션 도중에 콘텐츠·제목·← 유무가 바뀌면
   * 사용자가 보고 있던 화면이 갑자기 다른 화면으로 바뀌어 보이기 때문.
   * 다음에 열 때 openDetail/openAdd가 전부 다시 지정한다.
   */
  close: () => void;
}

export const useMissionSheetStore = create<MissionSheetState>((set) => ({
  open: false,
  mission: null,
  openSeq: 0,
  step: "detail",
  entry: "detail",
  openDetail: (mission) =>
    set((s) => ({
      open: true,
      mission,
      step: "detail",
      entry: "detail",
      openSeq: s.openSeq + 1,
    })),
  openAdd: (mission) =>
    set((s) => ({
      open: true,
      mission,
      step: "add",
      entry: "add",
      openSeq: s.openSeq + 1,
    })),
  goToAdd: () => set({ step: "add" }),
  goBackToDetail: () => set({ step: "detail" }),
  close: () => set({ open: false }),
}))
