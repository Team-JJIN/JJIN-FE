/**
 * @module api/plans
 * 일정(여행 플랜) 상세 API 모듈. 3층 구조:
 *   [DTO 타입: 서버 응답 그대로] → [mapper: 도메인 변환] → [fetch 함수: 훅이 호출]
 * `fetchPlans`(목록 GET)만 실연결, 상세는 목록 응답에서 파생, `savePlanDay`·`searchPlaces`는 mock.
 * 나머지는 가정 계약. 연결 현황: docs/plan_api_connect.md. 규칙: docs/API-RULE.md
 */

import { apiGet, ApiError } from "./client";
import {
  delay,
  mockFindPlanDetail,
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

export interface TravelPlanListDto {
  totalCount: number;
  travelPlans: TravelPlanSummaryDto[];
}

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

/** 상세 GET 연결 시 사용 — 지금은 상세 엔드포인트가 없어 fetchPlanDetail이 쓰지 않는다. */
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
  const data = (await apiGet<TravelPlanListDto>("/api/travel-plans")).data;
  return (data?.travelPlans ?? []).map(toPlan);
}

// 상세 엔드포인트가 없어 목록을 다시 조회해 해당 요약을 찾고, 일차 배열을 붙여 만든다 (docs/plan_api_connect.md 5).
export async function fetchPlanDetail(planId: string): Promise<PlanDetail> {
  const data = (await apiGet<TravelPlanListDto>("/api/travel-plans")).data;
  const summary = (data?.travelPlans ?? []).find(
    (p) => p.travelPlanId === Number(planId),
  );
  if (!summary) throw new ApiError(404, "일정을 찾을 수 없어요");

  // `|| 1`은 0·undefined·NaN을 한 번에 걷어낸다(필드 누락 시 Array.from이 빈 배열이 되는 것도 여기서 막힌다).
  const dayCount = Math.max(1, summary.days || 1);
  const mockDays = mockFindPlanDetail(Number(planId))?.days ?? [];

  return {
    ...toPlan(summary),
    // dayCount는 toPlan이 넣은 원본 summary.days를 클램프한 값으로 덮는다 — 일차 칩은 days 배열이
    // 아니라 dayCount로 그리므로(DayChips), 둘이 어긋나면 클램프가 화면에 닿지 않는다.
    dayCount,
    // 일차는 배열 위치가 아니라 dayIndex로 찾는다 — mock 일차 배열의 정렬은 우연한 성질이고,
    // 화면(PlanDetailPage)과 저장(mockSavePlanDay)도 dayIndex로 일차를 지목한다.
    // date는 mock 값이 있어도 버리고 항상 null로 둔다: 날짜의 출처는 서버 요약의 startDate
    // 하나뿐이어야 하는데, DayChips는 date가 있으면 그것을 우선하므로 mock 날짜를 살리면
    // 서버 startDate와 어긋난 날짜가 화면에 뜬다.
    days: Array.from({ length: dayCount }, (_, i) =>
      toPlanDay({
        dayIndex: i,
        date: null,
        places: mockDays.find((d) => d.dayIndex === i)?.places ?? [],
      }),
    ),
  };
}

export interface SavePlanDayInput {
  planId: string;
  dayIndex: number;
  places: PlanPlace[];
}

export async function savePlanDay(input: SavePlanDayInput): Promise<PlanDay> {
  // 추후: apiPost<TravelPlanDayDto>(`/api/travel-plans/${input.planId}/days/${input.dayIndex}/places`, body)
  // — PUT이면 client.ts에 apiPut 추가 필요
  // mock은 travelPlanId 1만 알기 때문에 실 planId(fetchPlanDetail로 받은)에서는 저장이 404로 실패한다.
  await delay();
  const body: SavePlanDayRequestDto = {
    places: input.places.map(savePlaceToDto),
  };
  const day = mockSavePlanDay(Number(input.planId), input.dayIndex, body);
  // date는 파생 상세와 같은 규칙으로 버린다 — 저장 응답이 캐시의 그 일차를 통째로 교체하므로
  // (useSavePlanDay), mock 날짜를 흘리면 무효화 재조회 전까지 서버 startDate와 다른 날짜가 뜬다.
  // 상세/저장 엔드포인트가 붙으면 이 한 줄만 지우고 toPlanDay(day)를 그대로 반환한다.
  return { ...toPlanDay(day), date: null };
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
