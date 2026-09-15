import { apiGet, apiPost } from "./client";
import {
  TRANSPORT_ENUM,
  LEVEL_ENUM,
  SUBCATEGORY_ENUM,
} from "@/app/[locale]/onboarding/_constants";
import type { OnboardingData } from "@/app/[locale]/onboarding/_types";

/** 여행 지역 (지역 검색 API 응답 항목) */
export interface Region {
  id: number;
  displayName: string;
  lDongRegnCd: string;
  lDongSignguCd: string | null;
}

/**
 * 여행 지역 검색.
 * 키워드가 지역 표시명에 포함된 지역을 오름차순으로 최대 20개 반환한다.
 * 키워드가 비어 있거나 공백이면 서버가 빈 배열을 반환한다.
 */
export async function searchRegions(keyword: string): Promise<Region[]> {
  const query = encodeURIComponent(keyword.trim());
  const res = await apiGet<Region[]>(`/api/onboarding/regions?keyword=${query}`);
  return res.data ?? [];
}

// ─────────────────────────────────────────────────────────────
// 여행 일정 생성 (POST /api/travel-plans)
// 기존 온보딩 화면을 일정 생성 화면으로 재사용한다. 응답은 { travelPlanId }이며
// 토큰/역할 갱신은 하지 않는다.
// ─────────────────────────────────────────────────────────────

/** 요청 바디의 취향 항목 (TourAPI 관광타입 contentType + 세부 취향 목록) */
export interface OnboardingPreference {
  contentType: string;
  subcategories: string[];
}

/** 여행 일정 생성 요청 바디 */
export interface OnboardingRequest {
  name: string; // 여행 일정명 (앞뒤 공백 제거, 공백 문자열 불가)
  regionId: number | null; // 지역 ID. regionUndecided=false이면 필수, true이면 반드시 null
  regionUndecided: boolean;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  activityStartTime: string; // HH:mm
  activityEndTime: string; // HH:mm
  transportMode: string;
  preferences: OnboardingPreference[]; // 서로 다른 관광타입 2~4개
  experienceLevel: string;
}

/** 여행 일정 생성 응답 data */
export interface OnboardingResult {
  travelPlanId: number;
}

/** 시(정수) + 분(문자열)을 HH:mm 형식으로 합친다. */
function toTimeString(hour: number, minute: string): string {
  return `${String(hour).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/**
 * 프론트 중분류 키 배열을 TourAPI 관광타입(contentType)별 preferences로 그룹핑한다.
 * 서버는 preferences[].contentType(TourApiContentType enum) + subcategories 형태를 기대한다.
 */
function buildPreferences(subCategories: string[]): OnboardingPreference[] {
  const grouped = new Map<string, string[]>();
  for (const sub of subCategories) {
    const mapped = SUBCATEGORY_ENUM[sub];
    if (!mapped) continue; // 매핑되지 않은 키는 무시
    const list = grouped.get(mapped.contentType) ?? [];
    if (!list.includes(mapped.subcategory)) list.push(mapped.subcategory);
    grouped.set(mapped.contentType, list);
  }
  return Array.from(grouped, ([contentType, subcategories]) => ({ contentType, subcategories }));
}

/**
 * OnboardingData(프론트 상태)를 여행 일정 생성 요청 바디로 변환한다.
 * - name: 여행 이름 (앞뒤 공백 제거)
 * - regionId: 지역 미정이면 null, 아니면 선택한 지역 ID
 * - transportMode: 복수 선택 중 첫 번째를 단일 값으로 전송
 * - activityStart/EndTime: 시(정수) + 분(문자열) → HH:mm
 * - preferences: 중분류 키를 TourAPI 관광타입(contentType)별로 그룹핑
 */
export function buildOnboardingRequest(
  data: OnboardingData,
  minuteStart: string,
  minuteEnd: string
): OnboardingRequest {
  const firstTransport = data.transport[0];
  return {
    name: data.tripName.trim(),
    // 서버 규칙: regionUndecided=true이면 regionId는 반드시 null, false이면 필수
    regionId: data.regionUndecided ? null : data.regionId,
    regionUndecided: data.regionUndecided,
    startDate: data.dateStart ?? "",
    endDate: data.dateEnd ?? "",
    activityStartTime: toTimeString(data.timeStart, minuteStart),
    activityEndTime: toTimeString(data.timeEnd, minuteEnd),
    transportMode: firstTransport ? TRANSPORT_ENUM[firstTransport] : "",
    preferences: buildPreferences(data.subCategories),
    experienceLevel: data.level ? LEVEL_ENUM[data.level] : "",
  };
}

/**
 * 여행 일정 생성.
 * S1~S4에서 모은 데이터를 한 번에 전송하고, 생성된 travelPlanId를 응답으로 받는다. (201 CREATED)
 * 토큰/역할 갱신은 없다.
 */
export async function submitOnboarding(body: OnboardingRequest): Promise<OnboardingResult> {
  const res = await apiPost<OnboardingResult>("/api/travel-plans", body);
  return res.data;
}
