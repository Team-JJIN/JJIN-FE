/**
 * @store usePlanEditStore
 * 일정 상세의 "일차 편집 모드" 로컬 draft 상태. mode가 "edit"인 동안 PlaceList가 draft를 그린다.
 *
 * 이 스토어의 draft는 API-RULE의 '서버 상태 사본 금지' 규칙의 명시적 예외 — 아직 저장되지 않은
 * 클라이언트 편집 상태이며, 저장 성공 즉시 discard()로 비운다. 진실 원천은 usePlanDetail 캐시.
 */
"use client";

import { create } from "zustand";
import type { PlanPlace, PlaceSearchResult } from "../_types";

export interface PlanEditState {
  planId: string | null;
  dayIndex: number;
  mode: "idle" | "edit";
  draft: PlanPlace[];
  beginEdit: (planId: string, dayIndex: number, places: PlanPlace[]) => void;
  removePlace: (id: string) => void;
  reorder: (next: PlanPlace[]) => void;
  toggleFromSearch: (r: PlaceSearchResult) => void;
  discard: () => void;
}

/** 방문 순번(1-based) 재부여 */
function reindex(places: PlanPlace[]): PlanPlace[] {
  return places.map((p, i) => ({ ...p, order: i + 1 }));
}

export const usePlanEditStore = create<PlanEditState>((set) => ({
  planId: null,
  dayIndex: 0,
  mode: "idle",
  draft: [],
  beginEdit: (planId, dayIndex, places) =>
    set({
      planId,
      dayIndex,
      mode: "edit",
      draft: reindex(structuredClone(places)),
    }),
  removePlace: (id) =>
    set((s) => ({ draft: reindex(s.draft.filter((p) => p.id !== id)) })),
  reorder: (next) => set({ draft: reindex(next) }),
  toggleFromSearch: (r) =>
    set((s) => {
      const alreadyAdded = s.draft.some((p) => p.placeId === r.id);
      if (alreadyAdded) {
        return { draft: reindex(s.draft.filter((p) => p.placeId !== r.id)) };
      }
      const added: PlanPlace = {
        id: `tmp-${r.id}`,
        placeId: r.id,
        order: s.draft.length + 1,
        name: r.name,
        address: r.address,
        category: null,
        isOpen: r.isOpen,
        openHours: r.openHours,
        lat: r.lat,
        lng: r.lng,
      };
      return { draft: [...s.draft, added] };
    }),
  discard: () => set({ planId: null, dayIndex: 0, mode: "idle", draft: [] }),
}));

export const selectIsEditing =
  (planId: string, dayIndex: number) => (s: PlanEditState) =>
    s.mode === "edit" && s.planId === planId && s.dayIndex === dayIndex;
