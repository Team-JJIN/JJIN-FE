/**
 * @module api/missions
 * 미션 도메인 API 모듈. 3층 구조:
 *   [DTO 타입: 서버 응답 그대로] → [mapper: 도메인 변환] → [fetch 함수: 훅이 호출]
 * 규칙: docs/API-RULE.md. 기준 구현: app/_api/feed.ts
 */

import { apiGet, apiPost, ApiError } from "./client";
import { apiDelete } from "./client-ext";
import {
  buildQuery,
  toDifficulty,
  toDifficultyDto,
  toPaginated,
  type MissionDifficultyDto,
  type MissionDifficulty,
  type Paginated,
} from "./shared";

// ───────────── DTO (서버 계약: BE 소스 com.JJIN.domain.mission) ─────────────

/** TourAPI KorService2 관광타입 8종 (TourApiContentType) */
export type TourApiContentTypeDto =
  | "TOURIST_ATTRACTION"
  | "CULTURAL_FACILITY"
  | "FESTIVAL_EVENT"
  | "TRAVEL_COURSE"
  | "LEISURE_SPORTS"
  | "LODGING"
  | "SHOPPING"
  | "RESTAURANT";

/** 미션 목록 조회 소스 (MissionSourceTypeOption) */
export type MissionSourceDto = "ALL" | "OFFICIAL" | "HOT" | "ADDED";

/** 정렬 쿼리 파라미터 값 (MissionSortOption.value, 대소문자 무시) */
export type MissionSortDto = "popular" | "latest";

/** 미션 검색 피드 카드 (MissionCardResponse) */
export interface MissionCardDto {
  missionId: number;
  title: string;
  thumbnailImageUrl: string | null;
  tags: string[];
  category: TourApiContentTypeDto;
  difficulty: MissionDifficultyDto;
  popularity: number;
  /** LocalDateTime — 타임존 없음. 도메인 Mission에는 쓰지 않는다 */
  createdAt: string;
  isAdded: boolean;
}

/** 미션 검색 피드 목록 응답 (MissionSearchFeedResponse) */
export interface MissionListDto {
  missions: MissionCardDto[];
  totalMissionCount: number;
  page: number;
  size: number;
  hasNext: boolean;
}

/** 미션 상세 응답 (MissionDetailResponse) */
export interface MissionDetailDto {
  missionId: number;
  title: string;
  representativeImageUrl: string | null;
  description: string;
  tags: string[];
  category: TourApiContentTypeDto;
  difficulty: MissionDifficultyDto;
  isAdded: boolean;
}

/** 일정별 미션 찜 여부 항목 (MissionLikeStatusResponse.PlanLikeItem) */
export interface MissionPlanLikeDto {
  planId: number;
  planName: string;
  /** LocalDate "YYYY-MM-DD" — 타임존 변환 대상 아님(LocalDateTime이 아니다) */
  planStartDate: string;
  planEndDate: string;
  isLiked: boolean;
  likeId: number | null;
}

/** 일정별 미션 찜 여부 응답 (MissionLikeStatusResponse) */
export interface MissionPlanLikesDto {
  totalPlans: number;
  likes: MissionPlanLikeDto[];
}

/** 미션 찜 설정 항목 (AddMissionToPlansResponse.LikeItem) */
export interface MissionLikeDto {
  likeId: number;
  planId: number;
}

/** 미션 찜 설정 응답 (AddMissionToPlansResponse) */
export interface MissionLikesDto {
  likes: MissionLikeDto[];
}

/** 미션 생성 요청 (CreateMissionRequest) */
export interface MissionCreateDto {
  imageUrl: string;
  title: string;
  description: string;
  difficulty: MissionDifficultyDto;
  tags: string[];
}

/** 미션 생성 응답 (CreateMissionResponse) — 훅/컴포넌트로 새지 않는 내부 전용 DTO */
interface MissionCreatedDto {
  missionId: number;
}

/** presigned URL 발급 요청 (PresignedUrlRequest) */
export interface PresignedUrlRequestDto {
  fileName: string;
  contentType: string;
}

/** presigned URL 발급 응답 (PresignedUrlResponse) */
export interface PresignedUrlDto {
  presignedUrl: string;
  fileName: string;
}

// ───────────── 도메인 타입 (훅/컴포넌트가 보는 형태) ─────────────

/** 서버 8코드를 그대로 쓴다 (결정 ① — 근사 매핑 대신 서버 코드로 교체, 카테고리는 검색 필터 전용) */
export type MissionCategory = TourApiContentTypeDto;

export type MissionFilter = "all" | "mustDo" | "hot" | "mine";

export type MissionSort = "popular" | "latest";

export interface Mission {
  id: string;
  title: string;
  imageUrl: string | null;
  difficulty: MissionDifficulty;
  category: MissionCategory;
  // UGC 자유 문자열 — 번역 대상 아님. 프리셋 칩 선택 시 표시 언어의 라벨이 그대로 저장됨(다국어 태그 공존은 의도된 동작)
  hashtags: string[];
  isAdded: boolean;
}

export interface MissionDetail extends Mission {
  description: string;
}

export interface MissionPlanLike {
  planId: string;
  planName: string;
  dateStart: string;
  dateEnd: string;
  isLiked: boolean;
  likeId: string | null;
}

export interface MissionPlanLikes {
  totalPlans: number;
  plans: MissionPlanLike[];
}

export interface MissionLike {
  likeId: string;
  planId: string;
}

export interface CreateMissionInput {
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  hashtags: string[];
  imageUrl: string;
}

export interface CreatedMission {
  id: string;
}

/** searchMissions 파라미터 — useMissionSearchCount가 cursor를 뺀 형태로 재사용한다 */
export interface SearchMissionsParams {
  query: string;
  categories: MissionCategory[];
  difficulty: MissionDifficulty | null;
  sort: MissionSort;
  cursor: number;
}

// 기존 소비처 호환 재수출 (경계 유틸은 shared.ts가 단일 진실 원천)
export type { MissionDifficulty, Paginated } from "./shared";

// ───────────── mapper ─────────────

export function toMission(dto: MissionCardDto): Mission {
  return {
    id: String(dto.missionId),
    title: dto.title,
    imageUrl: dto.thumbnailImageUrl,
    difficulty: toDifficulty(dto.difficulty),
    category: dto.category,
    hashtags: [...dto.tags],
    isAdded: dto.isAdded,
  };
}

export function toMissionDetail(dto: MissionDetailDto): MissionDetail {
  return {
    id: String(dto.missionId),
    title: dto.title,
    imageUrl: dto.representativeImageUrl,
    description: dto.description,
    difficulty: toDifficulty(dto.difficulty),
    category: dto.category,
    hashtags: [...dto.tags],
    isAdded: dto.isAdded,
  };
}

export function toMissionPlanLike(dto: MissionPlanLikeDto): MissionPlanLike {
  return {
    planId: String(dto.planId),
    planName: dto.planName,
    dateStart: dto.planStartDate,
    dateEnd: dto.planEndDate,
    isLiked: dto.isLiked,
    likeId: dto.likeId === null ? null : String(dto.likeId),
  };
}

export function toMissionPlanLikes(dto: MissionPlanLikesDto): MissionPlanLikes {
  return {
    totalPlans: dto.totalPlans,
    plans: dto.likes.map(toMissionPlanLike),
  };
}

export function toMissionLike(dto: MissionLikeDto): MissionLike {
  return {
    likeId: String(dto.likeId),
    planId: String(dto.planId),
  };
}

/** 홈 필터 → 서버 source (결정 ② — mine은 "내가 담은"=ADDED로 연결, 라벨은 i18n에서 교체) */
export const FILTER_TO_SOURCE: Record<MissionFilter, MissionSourceDto> = {
  all: "ALL",
  mustDo: "OFFICIAL",
  hot: "HOT",
  mine: "ADDED",
};

// ───────────── fetch 함수 ─────────────

export const MISSION_PAGE_SIZE = 20;
export const SEARCH_PAGE_SIZE = 20;

// 미션 추천 목록 (홈 필터별 무한 스크롤)
export async function fetchMissions({
  filter,
  cursor,
}: {
  filter: MissionFilter;
  cursor: number;
}): Promise<Paginated<Mission>> {
  const { data } = await apiGet<MissionListDto>(
    `/api/missions${buildQuery({
      source: FILTER_TO_SOURCE[filter],
      page: cursor,
      size: MISSION_PAGE_SIZE,
    })}`,
  );
  return toPaginated(data, (data.missions ?? []).map(toMission));
}

// 미션 검색 (검색어/카테고리/난이도/정렬)
export async function searchMissions({
  query,
  categories,
  difficulty,
  sort,
  cursor,
}: SearchMissionsParams): Promise<Paginated<Mission> & { totalCount: number }> {
  const { data } = await apiGet<MissionListDto>(
    `/api/missions${buildQuery({
      keyword: query || undefined,
      categories,
      difficulties: difficulty ? [toDifficultyDto(difficulty)] : undefined,
      sort,
      page: cursor,
      size: SEARCH_PAGE_SIZE,
    })}`,
  );
  return {
    ...toPaginated(data, (data.missions ?? []).map(toMission)),
    totalCount: data.totalMissionCount,
  };
}

// 미션 상세
export async function fetchMissionDetail(
  missionId: string,
): Promise<MissionDetail> {
  const { data } = await apiGet<MissionDetailDto>(`/api/missions/${Number(missionId)}`);
  return toMissionDetail(data);
}

// 미션의 일정별 찜 여부 (일정 추가 패널)
export async function fetchMissionPlanLikes(
  missionId: string,
): Promise<MissionPlanLikes> {
  const { data } = await apiGet<MissionPlanLikesDto>(
    `/api/missions/likes/${Number(missionId)}`,
  );
  return toMissionPlanLikes(data);
}

// 미션 찜 설정 (멱등) — planIds 경계에서만 Number() 변환
export async function addMissionToPlans(
  missionId: string,
  planIds: string[],
): Promise<MissionLike[]> {
  const { data } = await apiPost<MissionLikesDto>(
    `/api/missions/${Number(missionId)}`,
    {
      planIds: planIds.map(Number),
    },
  );
  return data.likes.map(toMissionLike);
}

// 미션 찜 해제
export async function removeMissionFromPlans(
  missionId: string,
  planIds: string[],
): Promise<void> {
  await apiDelete(`/api/missions/${Number(missionId)}`, {
    planIds: planIds.map(Number),
  });
}

// 미션 생성 (이미지는 uploadMissionImage로 먼저 업로드한 URL을 받는다)
export async function createMission(
  input: CreateMissionInput,
): Promise<CreatedMission> {
  const { data } = await apiPost<MissionCreatedDto>("/api/missions", {
    imageUrl: input.imageUrl,
    title: input.title,
    description: input.description,
    difficulty: toDifficultyDto(input.difficulty),
    tags: input.hashtags,
  });
  return { id: String(data.missionId) };
}

// 미션 생성 이미지 업로드 — presigned URL 발급 후 S3에 직접 PUT (인증 헤더·응답 봉투 없음)
// BE 확인 필요: imageUrl로 공개 객체 URL을 보내는지 key(fileName)를 보내는지 미확정(plan §6-1).
// 여기서는 presignedUrl의 origin+pathname(공개 객체 URL로 추정)을 보낸다.
export async function uploadMissionImage(file: File): Promise<string> {
  const { data } = await apiPost<PresignedUrlDto>(
    "/api/missions/presigned-url",
    {
      fileName: file.name,
      contentType: file.type,
    },
  );

  // 버킷 CORS 미설정·네트워크 단절은 fetch가 TypeError로 reject한다 — ApiError로 통일해 폼이 같은 경로로 처리
  let res: Response;
  try {
    res = await fetch(data.presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
  } catch {
    throw new ApiError(0, "이미지 업로드 서버에 연결할 수 없습니다.");
  }
  if (!res.ok) {
    throw new ApiError(res.status, "이미지 업로드에 실패했습니다.");
  }

  const u = new URL(data.presignedUrl);
  return u.origin + u.pathname;
}
