/**
 * @store useKakaoStore
 * Kakao Maps SDK 로드 상태(전역 단일). KakaoMapsScript가 쓰고, useKakaoLoader·PlanMap이 읽는다.
 */
"use client";

import { create } from "zustand";

export type KakaoStatus = "idle" | "loading" | "ready" | "error" | "nokey";

export interface KakaoState {
  status: KakaoStatus;
  setStatus: (s: KakaoStatus) => void;
}

export const useKakaoStore = create<KakaoState>((set) => ({
  status: "idle",
  setStatus: (status) => set({ status }),
}));
