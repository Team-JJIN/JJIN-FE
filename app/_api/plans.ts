/**
 * @module api/plans
 * 일정(여행 플랜) 상세 API 모듈. 3층 구조:
 *   [DTO 타입: 서버 응답 그대로] → [mapper: 도메인 변환] → [fetch 함수: 훅이 호출]
 * 백엔드 명세 미확정 → 가정 계약, docs/plan_api_connect.md(커밋 ③에서 작성). 전부 mock. 규칙: docs/API-RULE.md
 */

import {
  delay,
  mockFetchPlans,
  mockFetchPlanDetail,
  mockSavePlanDay,
  mockSearchPlaces,
} from "./mock/plans.mock";

// ───────────── DTO (가정 계약, 백엔드 명세 미확정) ─────────────

export interface TravelPlanSummaryDto {
  travelPlanId: number;
  name: string;
  startDate: string;
  endDate: string;
  days: number;
} // GET /api/travel-plans 실제 필드 부분집합

export interface TravelPlanPlaceDto {
  planPlaceId: number;
  placeId: number;
  order: number;
  name: string;
  address: string;
  category: string | null;
  isOpen: boolean | null;
  openTime: string | null;
  closeTime: string | null;
  latitude: number;
  longitude: number;
}

export interface TravelPlanDayDto {
  dayIndex: number;
  date: string | null;
  places: TravelPlanPlaceDto[];
}

// TravelPlanSummaryDto의 days(number, 총 일수)와 이름이 겹치되 타입이 다르므로 Omit으로 제외 후 배열로 재정의한다.
export interface TravelPlanDetailDto extends Omit<
  TravelPlanSummaryDto,
  "days"
> {
  days: TravelPlanDayDto[];
}

export interface SavePlanDayRequestDto {
  places: { placeId: number; order: number }[];
}

export type PlaceSortDto = "RECENT" | "DISTANCE" | "RATING";

export interface PlaceSearchResultDto {
  placeId: number;
  name: string;
  address: string;
  distanceMeters: number | null;
  isOpen: boolean | null;
  openTime: string | null;
  closeTime: string | null;
  thumbnailUrl: string | null;
  rating: number | null;
  latitude: number;
  longitude: number;
}

// ───────────── 도메인 타입 (훅/컴포넌트가 보는 형태) ─────────────

export interface Plan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  dayCount: number;
}

/** "09:00" */
export interface OpenHours {
  start: string;
  end: string;
}

export interface PlanPlace {
  id: string;
  placeId: string;
  order: number;
  name: string;
  address: string;
  category: string | null;
  isOpen: boolean | null;
  openHours: OpenHours | null;
  lat: number;
  lng: number;
}

export interface PlanDay {
  dayIndex: number;
  date: string | null;
  places: PlanPlace[];
}

export interface PlanDetail extends Plan {
  days: PlanDay[];
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  distanceMeters: number | null;
  isOpen: boolean | null;
  openHours: OpenHours | null;
  thumbnailUrl: string | null;
  rating: number | null;
  lat: number;
  lng: number;
}

export type PlaceSort = "recent" | "distance" | "rating";

// ───────────── mapper ─────────────

export const PLACE_SORT_TO_DTO: Record<PlaceSort, PlaceSortDto> = {
  recent: "RECENT",
  distance: "DISTANCE",
  rating: "RATING",
};

/** openTime·closeTime 둘 다 있을 때만 OpenHours, 아니면 null. toPlanPlace·toPlaceSearchResult가 공유 */
function toOpenHours(
  openTime: string | null,
  closeTime: string | null,
): OpenHours | null {
  if (!openTime || !closeTime) return null;
  return { start: openTime, end: closeTime };
}

export function toPlan(dto: TravelPlanSummaryDto): Plan {
  return {
    id: String(dto.travelPlanId),
    name: dto.name,
    startDate: dto.startDate,
    endDate: dto.endDate,
    dayCount: dto.days,
  };
}

export function toPlanPlace(dto: TravelPlanPlaceDto): PlanPlace {
  return {
    id: String(dto.planPlaceId),
    placeId: String(dto.placeId),
    order: dto.order,
    name: dto.name,
    address: dto.address,
    category: dto.category,
    isOpen: dto.isOpen,
    openHours: toOpenHours(dto.openTime, dto.closeTime),
    lat: dto.latitude,
    lng: dto.longitude,
  };
}

export function toPlanDay(dto: TravelPlanDayDto): PlanDay {
  return {
    dayIndex: dto.dayIndex,
    date: dto.date,
    places: dto.places.map(toPlanPlace),
  };
}

export function toPlanDetail(dto: TravelPlanDetailDto): PlanDetail {
  return {
    id: String(dto.travelPlanId),
    name: dto.name,
    startDate: dto.startDate,
    endDate: dto.endDate,
    dayCount: dto.days.length,
    days: dto.days.map(toPlanDay),
  };
}

export function toPlaceSearchResult(
  dto: PlaceSearchResultDto,
): PlaceSearchResult {
  return {
    id: String(dto.placeId),
    name: dto.name,
    address: dto.address,
    distanceMeters: dto.distanceMeters,
    isOpen: dto.isOpen,
    openHours: toOpenHours(dto.openTime, dto.closeTime),
    thumbnailUrl: dto.thumbnailUrl,
    rating: dto.rating,
    lat: dto.latitude,
    lng: dto.longitude,
  };
}

export function savePlaceToDto(p: PlanPlace): {
  placeId: number;
  order: number;
} {
  return { placeId: Number(p.placeId), order: p.order };
}

// ───────────── fetch 함수 ─────────────

export async function fetchPlans(): Promise<Plan[]> {
  // 추후: (await apiGet<{ totalCount: number; travelPlans: TravelPlanSummaryDto[] }>("/api/travel-plans")).data.travelPlans
  await delay();
  return mockFetchPlans().map(toPlan);
}

export async function fetchPlanDetail(planId: string): Promise<PlanDetail> {
  // 추후: apiGet<TravelPlanDetailDto>(`/api/travel-plans/${planId}`)
  await delay();
  return toPlanDetail(mockFetchPlanDetail(Number(planId)));
}

export interface SavePlanDayInput {
  planId: string;
  dayIndex: number;
  places: PlanPlace[];
}

export async function savePlanDay(input: SavePlanDayInput): Promise<PlanDay> {
  // 추후: apiPost<TravelPlanDayDto>(`/api/travel-plans/${input.planId}/days/${input.dayIndex}/places`, body)
  // — PUT이면 client.ts에 apiPut 추가 필요
  await delay();
  const body: SavePlanDayRequestDto = {
    places: input.places.map(savePlaceToDto),
  };
  return toPlanDay(mockSavePlanDay(Number(input.planId), input.dayIndex, body));
}

export interface SearchPlacesInput {
  keyword: string;
  sort: PlaceSort;
}

export async function searchPlaces(
  input: SearchPlacesInput,
): Promise<PlaceSearchResult[]> {
  // 추후: apiGet<{ places: PlaceSearchResultDto[] }>("/api/places/search", { keyword: input.keyword, sort: PLACE_SORT_TO_DTO[input.sort] })
  await delay();
  return mockSearchPlaces(input.keyword, PLACE_SORT_TO_DTO[input.sort]).map(
    toPlaceSearchResult,
  );
}
