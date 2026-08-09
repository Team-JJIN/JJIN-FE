import { apiPost } from "./client";
import type { ApiResponse } from "./client";

export interface OnboardingRequest {
  region: string | null;
  regionUndecided: boolean;
  startDate: string;
  endDate: string;
  activityStartTime: string;
  activityEndTime: string;
  transportMode: string;
  preferences: { category: string; subcategories: string[] }[];
  experienceLevel: string;
}

export interface OnboardingResponse {
  onboardingId: number;
  accessToken: string;
  refreshToken: string;
  role: string;
}

/** 온보딩 데이터 제출 (S4 시작하기 시 호출) */
export async function submitOnboarding(body: OnboardingRequest): Promise<OnboardingResponse> {
  const res = await apiPost<OnboardingResponse>("/api/onboarding", body);
  return res.data;
}
