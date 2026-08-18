/**
 * @store useAddMissionStore
 * 미션 추가 오버레이 상태. targetMission이 null이 아니면 오버레이가 열린 상태.
 */
"use client";

import { create } from "zustand";
import type { Mission } from "@/app/_api/missions";

interface AddMissionState {
  targetMission: Mission | null;
  open: (mission: Mission) => void;
  close: () => void;
}

export const useAddMissionStore = create<AddMissionState>((set) => ({
  targetMission: null,
  open: (mission) => set({ targetMission: mission }),
  close: () => set({ targetMission: null }),
}));
