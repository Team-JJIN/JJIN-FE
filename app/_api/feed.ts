/**
 * @module api/feed
 * 미션 인증 피드 API 모듈. 3층 구조:
 *   [DTO 타입: 서버 응답 그대로] → [mapper: 도메인 변환] → [fetch 함수: 훅이 호출]
 * 현재 fetch 함수 본문은 mock을 부르지만, mock도 DTO 페이지를 만들어 같은 mapper를 통과하므로
 * 실서버 전환 시 각 fetch 함수의 `// 추후:` 한 줄로 본문만 바꾸면 된다. 규칙: docs/API-RULE.md
 * (주의: client.ts에는 아직 apiGet이 없음 — 연동 시 apiPost와 같은 서명으로 추가)
 */

import type { Mission, MissionDifficulty, Paginated } from "./missions";
import {
  findMockMission,
  mockCommentPage,
  mockCreateComment,
  mockFeedPage,
  mockToggleLike,
} from "./mock/feed.mock";

// ───────────── DTO (서버 계약: Notion Temp API "미션 인증 피드") ─────────────

/** 피드 탭 서버 enum (MissionProofFeedTab) */
export type FeedTabDto = "LATEST" | "POPULAR" | "WEEKLY_HOT" | "COMPLETED";

/** 난이도 서버 enum */
export type MissionDifficultyDto = "ONE" | "TWO" | "THREE";

export interface FeedAuthorDto {
  memberId: number;
  nickname: string;
  profileImageUrl: string | null;
}

/** 피드 item.mission — 요약 4필드뿐. 전체 Mission이 아니다 (계약 공백 #1) */
export interface FeedMissionSummaryDto {
  missionId: number;
  title: string;
  difficulty: MissionDifficultyDto;
  weeklyCompletedCount: number;
}

export interface FeedItemDto {
  proofId: number;
  author: FeedAuthorDto;
  imageUrl: string;
  content: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  /** LocalDateTime — 타임존 없음 ("2026-08-11T02:09:15"). KST로 간주 (normalizeServerDate) */
  createdAt: string;
  mission: FeedMissionSummaryDto;
}

/** page/size/hasNext 페이지 메타 (피드·댓글 공통) */
export interface PageMetaDto {
  page: number;
  size: number;
  hasNext: boolean;
}

export interface FeedPageDto extends PageMetaDto {
  tab: FeedTabDto;
  items: FeedItemDto[];
}

export interface FeedLikeToggleDto {
  proofId: number;
  liked: boolean;
  likeCount: number;
}

export interface FeedCommentDto {
  commentId: number;
  author: { memberId: number; nickname: string };
  content: string;
  /** LocalDateTime — 타임존 없음 */
  createdAt: string;
}

/** 댓글 목록 — 배열 필드명이 items가 아니라 comments임에 주의 */
export interface FeedCommentPageDto extends PageMetaDto {
  proofId: number;
  comments: FeedCommentDto[];
}

export interface FeedCommentCreateDto {
  commentId: number;
  proofId: number;
  content: string;
  /** 서버 계산 표시 문자열. 클라이언트는 쓰지 않는다 (언어별 표기 + 표시 시점 재계산 필요) */
  timeAgo: string;
  createdAt: string;
  commentCount: number;
}

// ───────────── 도메인 타입 (훅/컴포넌트가 보는 형태) ─────────────

export type FeedTab = "latest" | "popular" | "weeklyHot" | "completed";

export interface FeedAuthor {
  id: string;
  nickname: string;
  avatarUrl: string | null;
}

/** 피드 카드 하단 미션 요약 = 기존 Mission(추가 토글·시트가 요구) + 주간 완료 수 */
export interface FeedMission extends Mission {
  weeklyCompletedCount: number;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  imageUrl: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  /** ISO 8601 (타임존 포함) */
  createdAt: string;
  mission: FeedMission;
}

export interface FeedComment {
  id: string;
  author: FeedAuthor;
  content: string;
  /** ISO 8601 (타임존 포함) */
  createdAt: string;
}

export interface FeedLikeResult {
  postId: string;
  liked: boolean;
  likeCount: number;
}

export interface CreatedFeedComment {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  /** 생성 후 게시글의 총 댓글 수 — 피드 카드/시트 제목 갱신에 쓴다 */
  commentCount: number;
}

// ───────────── mapper ─────────────

export const FEED_TAB_TO_DTO: Record<FeedTab, FeedTabDto> = {
  latest: "LATEST",
  popular: "POPULAR",
  weeklyHot: "WEEKLY_HOT",
  completed: "COMPLETED",
};

const DIFFICULTY_FROM_DTO: Record<MissionDifficultyDto, MissionDifficulty> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
};

export function toDifficulty(dto: MissionDifficultyDto): MissionDifficulty {
  return DIFFICULTY_FROM_DTO[dto];
}

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/** 서버 LocalDateTime(타임존 없음)을 KST(+09:00)로 못박은 ISO 문자열로 만든다. 이미 타임존이 있으면 그대로 */
export function normalizeServerDate(value: string): string {
  return HAS_ZONE.test(value) ? value : `${value}+09:00`;
}

/** 서버 {page, hasNext} 페이지를 앱의 커서 페이지네이션으로 (다음 커서 = page + 1) */
export function toPaginated<TDto, T>(
  meta: PageMetaDto,
  items: TDto[],
  mapItem: (dto: TDto) => T,
): Paginated<T> {
  return {
    items: items.map(mapItem),
    nextCursor: meta.hasNext ? meta.page + 1 : null,
  };
}

/**
 * mission 인자: 카드의 추가 토글·상세 시트가 전체 Mission을 요구하지만 피드 item.mission은 요약 4필드뿐이다.
 * 그래서 호출부가 전체 Mission을 넘기고, 요약 DTO의 값(title/difficulty/weeklyCompletedCount)으로 덮는다.
 * 계약 공백 #1 (docs/API-RULE.md) — 서버가 item.mission을 확장하면 두 번째 인자를 없앤다.
 */
export function toFeedPost(dto: FeedItemDto, mission: Mission): FeedPost {
  return {
    id: String(dto.proofId),
    author: {
      id: String(dto.author.memberId),
      nickname: dto.author.nickname,
      avatarUrl: dto.author.profileImageUrl,
    },
    imageUrl: dto.imageUrl,
    content: dto.content,
    likeCount: dto.likeCount,
    likedByMe: dto.likedByMe,
    commentCount: dto.commentCount,
    createdAt: normalizeServerDate(dto.createdAt),
    mission: {
      // id는 전체 Mission 것을 그대로 쓴다 (mock: "mission-N"; 실서버 전환 시 Mission.id는
      // String(serverId)로 통일되므로 동일하다). 요약 DTO의 missionId는 조회 키일 뿐 덮어쓰지 않는다.
      ...mission,
      title: dto.mission.title,
      difficulty: toDifficulty(dto.mission.difficulty),
      weeklyCompletedCount: dto.mission.weeklyCompletedCount,
    },
  };
}

export function toFeedComment(dto: FeedCommentDto): FeedComment {
  return {
    id: String(dto.commentId),
    author: {
      id: String(dto.author.memberId),
      nickname: dto.author.nickname,
      // 계약 공백 #2: 댓글 author에 profileImageUrl이 없다
      avatarUrl: null,
    },
    content: dto.content,
    createdAt: normalizeServerDate(dto.createdAt),
  };
}

export function toFeedLikeResult(dto: FeedLikeToggleDto): FeedLikeResult {
  return {
    postId: String(dto.proofId),
    liked: dto.liked,
    likeCount: dto.likeCount,
  };
}

export function toCreatedFeedComment(
  dto: FeedCommentCreateDto,
): CreatedFeedComment {
  return {
    id: String(dto.commentId),
    postId: String(dto.proofId),
    content: dto.content,
    createdAt: normalizeServerDate(dto.createdAt),
    commentCount: dto.commentCount,
  };
}

// ───────────── fetch 함수 ─────────────

/** mock 무한 스크롤 확인용으로 작게 둔다. 실서버 연동 시 서버 기본값 10(최대 50)으로 */
export const FEED_PAGE_SIZE = 3;
/** 서버 기본값과 동일 */
export const COMMENT_PAGE_SIZE = 20;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// 미션 인증 피드 (탭별 페이지)
export async function fetchFeed({
  tab,
  cursor,
}: {
  tab: FeedTab;
  cursor: number;
}): Promise<Paginated<FeedPost>> {
  // 추후 (경로는 가정 — docs/API-RULE.md 계약 공백 #6):
  // const page = (await apiGet<FeedPageDto>(`/api/mission-proofs/feed?${new URLSearchParams({ tab: FEED_TAB_TO_DTO[tab], page: String(cursor), size: String(FEED_PAGE_SIZE) })}`)).data;
  await delay(400);
  const page = mockFeedPage(FEED_TAB_TO_DTO[tab], cursor, FEED_PAGE_SIZE);
  // 추후: toFeedPost 두 번째 인자(findMockMission)는 계약 공백 #1 해소 후 제거(서버 item.mission 확장) 또는 미션 상세 조회로 대체
  return toPaginated(page, page.items, (item) =>
    toFeedPost(item, findMockMission(item.mission.missionId)),
  );
}

// 피드 좋아요 토글 — 서버가 토글 후 상태를 돌려준다 (클라이언트는 원하는 상태를 보내지 않는다)
export async function toggleFeedLike(postId: string): Promise<FeedLikeResult> {
  // 추후: return toFeedLikeResult((await apiPost<FeedLikeToggleDto>(`/api/mission-proofs/${Number(postId)}/likes`, {})).data);
  await delay(300);
  return toFeedLikeResult(mockToggleLike(Number(postId)));
}

// 댓글 목록 (오래된 순, page 0 = 가장 오래된 댓글 — 정렬은 가정, 계약 공백 #5)
export async function fetchFeedComments({
  postId,
  cursor,
}: {
  postId: string;
  cursor: number;
}): Promise<Paginated<FeedComment>> {
  // 추후: const page = (await apiGet<FeedCommentPageDto>(`/api/mission-proofs/${Number(postId)}/comments?${new URLSearchParams({ page: String(cursor), size: String(COMMENT_PAGE_SIZE) })}`)).data;
  await delay(300);
  const page = mockCommentPage(Number(postId), cursor, COMMENT_PAGE_SIZE);
  return toPaginated(page, page.comments, toFeedComment);
}

// 댓글 생성
export async function createFeedComment(
  postId: string,
  content: string,
): Promise<CreatedFeedComment> {
  // 추후: return toCreatedFeedComment((await apiPost<FeedCommentCreateDto>(`/api/mission-proofs/${Number(postId)}/comments`, { content })).data);
  await delay(300);
  return toCreatedFeedComment(mockCreateComment(Number(postId), content));
}
