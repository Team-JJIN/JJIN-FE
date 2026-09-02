import { apiGet, apiPost } from "./client";
import type { AuthTokens } from "./auth";
import {
  REGION_ENUM,
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
// 온보딩 저장 (POST /api/onboarding)
// ─────────────────────────────────────────────────────────────

/** 온보딩 저장 요청 바디의 취향 항목 (대분류 contentType + 중분류 목록) */
export interface OnboardingPreference {
  contentType: string;
  subcategories: string[];
}

/** 온보딩 저장 요청 바디 */
export interface OnboardingRequest {
  region: string | null;
  regionUndecided: boolean;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  activityStartTime: string; // HH:mm
  activityEndTime: string; // HH:mm
  transportMode: string;
  preferences: OnboardingPreference[];
  experienceLevel: string;
}

/** 온보딩 저장 응답 data (토큰/역할 + 생성된 온보딩 ID). role은 저장 후 "MEMBER" */
export interface OnboardingResult extends AuthTokens {
  onboardingId: number;
}

/** 시(정수) + 분(문자열)을 HH:mm 형식으로 합친다. */
function toTimeString(hour: number, minute: string): string {
  return `${String(hour).padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

/**
 * 프론트 중분류 키 배열을 백엔드 대분류(contentType)별 preferences로 그룹핑한다.
 * 서버는 preferences[].contentType(TRAVEL TYPE enum) + subcategories 형태를 기대한다.
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
 * OnboardingData(프론트 상태)를 온보딩 저장 요청 바디로 변환한다.
 * - region: 지역 미정이면 null, 아니면 한국어 표시명을 REGION enum으로 변환
 * - transportMode: 복수 선택 중 첫 번째를 단일 값으로 전송
 * - activityStart/EndTime: 시(정수) + 분(문자열) → HH:mm
 * - preferences: 중분류 키를 백엔드 대분류별로 그룹핑
 */
export function buildOnboardingRequest(
  data: OnboardingData,
  minuteStart: string,
  minuteEnd: string
): OnboardingRequest {
  const firstTransport = data.transport[0];
  return {
    region: data.regionUndecided ? null : (REGION_ENUM[data.region] ?? null),
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
 * 온보딩 정보 저장.
 * S1~S4에서 모은 데이터를 한 번에 전송하고, 저장 후 MEMBER 역할이 반영된
 * 새 access/refresh token과 변경된 role을 응답으로 받는다.
 *
 * ⚠️ 주의: 백엔드가 온보딩 요청에 '여행 이름' 필드를 required로 추가하면서,
 *   현재는 이름을 함께 보내지 않아 저장 시 400(요청 필드 값 유효하지 않음)이 발생한다.
 *   백엔드에서 여행 이름을 nullable로 변경하거나 필드 스펙이 확정되면 OnboardingRequest에 추가할 것.
 */
export async function submitOnboarding(body: OnboardingRequest): Promise<OnboardingResult> {
  const res = await apiPost<OnboardingResult>("/api/onboarding", body);
  return res.data;
}
