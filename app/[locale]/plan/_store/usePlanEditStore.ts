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
  original: PlanPlace[];
  recoveryRequired: boolean;
  recoveryPlanId: string | null;
  recoveryDayIndex: number | null;
  saving: boolean;
  beginEdit: (planId: string, dayIndex: number, places: PlanPlace[]) => void;
  removePlace: (id: string) => void;
  reorder: (next: PlanPlace[]) => void;
  toggleFromSearch: (r: PlaceSearchResult) => void;
  discard: () => void;
  requireRecovery: (planId: string, dayIndex: number) => void;
  clearRecovery: (planId: string, dayIndex: number) => void;
  setSaving: (value: boolean) => void;
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
  original: [],
  recoveryRequired: false,
  recoveryPlanId: null,
  recoveryDayIndex: null,
  saving: false,
  beginEdit: (planId, dayIndex, places) =>
    set((s) =>
      s.saving ||
      (s.recoveryRequired &&
        s.recoveryPlanId === planId &&
        s.recoveryDayIndex === dayIndex)
        ? s
        : {
            planId,
            dayIndex,
            mode: "edit",
            draft: reindex(structuredClone(places)),
            original: structuredClone(places),
          },
    ),
  removePlace: (id) =>
    set((s) =>
      s.saving ? s : { draft: reindex(s.draft.filter((p) => p.id !== id)) },
    ),
  reorder: (next) => set((s) => (s.saving ? s : { draft: reindex(next) })),
  toggleFromSearch: (r) =>
    set((s) => {
      if (
        s.mode !== "edit" ||
        s.saving ||
        (s.recoveryRequired &&
          s.recoveryPlanId === s.planId &&
          s.recoveryDayIndex === s.dayIndex)
      )
        return s;
      const alreadyAdded = s.draft.some((p) => p.placeId === r.id);
      if (alreadyAdded) {
        return { draft: reindex(s.draft.filter((p) => p.placeId !== r.id)) };
      }
      // 검색의 alreadyAdded는 일정 전체 기준. 현재 일차에서 지운 항목은 원래 stopId를 복원한다.
      const original = s.original.find((p) => p.placeId === r.id);
      if (r.alreadyAdded && !original) return s;
      if (original) return { draft: reindex([...s.draft, { ...original }]) };
      const added: PlanPlace = {
        id: `tmp-${r.id}`,
        placeId: r.id,
        order: s.draft.length + 1,
        name: r.name,
        address: r.address,
        category: r.category,
        openStatus: r.openStatus,
        openHours: r.openHours,
        openTime: r.openTime,
        closeTime: r.closeTime,
        lat: r.lat,
        lng: r.lng,
        distanceFromPreviousMeters: null,
      };
      return { draft: [...s.draft, added] };
    }),
  discard: () =>
    set((s) =>
      s.saving
        ? s
        : {
            planId: null,
            dayIndex: 0,
            mode: "idle",
            draft: [],
            original: [],
          },
    ),
  requireRecovery: (planId, dayIndex) =>
    set({
      planId: null,
      dayIndex: 0,
      mode: "idle",
      draft: [],
      original: [],
      recoveryRequired: true,
      recoveryPlanId: planId,
      recoveryDayIndex: dayIndex,
    }),
  clearRecovery: (planId, dayIndex) =>
    set((s) =>
      s.recoveryPlanId === planId && s.recoveryDayIndex === dayIndex
        ? {
            recoveryRequired: false,
            recoveryPlanId: null,
            recoveryDayIndex: null,
          }
        : s,
    ),
  setSaving: (value) => set({ saving: value }),
}));

export const selectIsEditing =
  (planId: string, dayIndex: number) => (s: PlanEditState) =>
    s.mode === "edit" && s.planId === planId && s.dayIndex === dayIndex;
