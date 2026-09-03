/**
 * @module api/feed
 * 미션 인증 피드 API 모듈. 3층 구조:
 *   [DTO 타입: 서버 응답 그대로] → [mapper: 도메인 변환] → [fetch 함수: 훅이 호출]
 * 실서버(`/api/missions/proofs/*`) 연결됨. 공용 DTO·mapper(`MissionDifficultyDto`, `Paginated`,
 * `toPaginated`, `normalizeServerDate` 등)는 app/_api/shared.ts에서 가져온다. 규칙: docs/API-RULE.md
 */

import { apiGet, apiPost } from "./client";
import {
  toDifficulty,
  toPaginated,
  normalizeServerDate,
  type MissionDifficulty,
  type MissionDifficultyDto,
  type PageMetaDto,
  type Paginated,
} from "./shared";

// ───────────── DTO (서버 계약: MissionProofController, BE 소스 verbatim) ─────────────

/** 피드 탭 서버 enum (MissionProofFeedTab) */
export type FeedTabDto = "LATEST" | "POPULAR" | "WEEKLY_HOT" | "COMPLETED";

export interface FeedAuthorDto {
  memberId: number;
  nickname: string | null;
  profileImageUrl: string | null;
}

/** 피드 item.mission — 요약 4필드뿐. 전체 Mission이 아니다 (계약 공백 #1, docs/API-RULE.md) */
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

export interface FeedPageDto extends PageMetaDto {
  tab: FeedTabDto;
  items: FeedItemDto[];
}

export interface FeedLikeToggleDto {
  proofId: number;
  liked: boolean;
  likeCount: number;
}

/** 댓글 작성자 — 피드 author(MissionProofAuthorResponse)와 별개 타입(MissionProofCommentAuthorResponse). profileImageUrl 없음 */
export interface FeedCommentAuthorDto {
  memberId: number;
  nickname: string | null;
}

export interface FeedCommentDto {
  commentId: number;
  author: FeedCommentAuthorDto;
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

/**
 * 피드 카드 하단 미션 요약. 서버 item.mission이 4필드뿐이라(계약 공백 #1) 카드 추가 토글·상세 시트가
 * 요구하는 isAdded/imageUrl/category/hashtags 등은 없다 — 소비처는 missionId로 미션 상세를 따로 연다.
 */
export interface FeedMissionSummary {
  id: string;
  title: string;
  difficulty: MissionDifficulty;
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
  mission: FeedMissionSummary;
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

export function toFeedPost(dto: FeedItemDto): FeedPost {
  return {
    id: String(dto.proofId),
    author: {
      id: String(dto.author.memberId),
      nickname: dto.author.nickname ?? "",
      avatarUrl: dto.author.profileImageUrl,
    },
    imageUrl: dto.imageUrl,
    content: dto.content,
    likeCount: dto.likeCount,
    likedByMe: dto.likedByMe,
    commentCount: dto.commentCount,
    createdAt: normalizeServerDate(dto.createdAt),
    mission: {
      id: String(dto.mission.missionId),
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
      nickname: dto.author.nickname ?? "",
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

/** 서버 기본값과 동일 */
export const FEED_PAGE_SIZE = 10;
/** 서버 기본값과 동일 */
export const COMMENT_PAGE_SIZE = 20;

// 미션 인증 피드 (탭별 페이지)
export async function fetchFeed({
  tab,
  cursor,
}: {
  tab: FeedTab;
  cursor: number;
}): Promise<Paginated<FeedPost>> {
  const page = (
    await apiGet<FeedPageDto>("/api/missions/proofs/feed", {
      tab: FEED_TAB_TO_DTO[tab],
      page: cursor,
      size: FEED_PAGE_SIZE,
    })
  ).data;
  return toPaginated(page, page.items.map(toFeedPost));
}

// 피드 좋아요 토글 — 서버가 토글 후 상태를 돌려준다 (클라이언트는 원하는 상태를 보내지 않는다)
export async function toggleFeedLike(postId: string): Promise<FeedLikeResult> {
  const result = (
    await apiPost<FeedLikeToggleDto>(
      `/api/missions/proofs/${Number(postId)}/likes/toggle`,
    )
  ).data;
  return toFeedLikeResult(result);
}

// 댓글 목록 (오래된 순, page 0 = 가장 오래된 댓글 — BE MissionProofCommentRepository가 `order by createdAt asc, id asc`로 정렬)
export async function fetchFeedComments({
  postId,
  cursor,
}: {
  postId: string;
  cursor: number;
}): Promise<Paginated<FeedComment>> {
  const page = (
    await apiGet<FeedCommentPageDto>(
      `/api/missions/proofs/${Number(postId)}/comments`,
      { page: cursor, size: COMMENT_PAGE_SIZE },
    )
  ).data;
  return toPaginated(page, page.comments.map(toFeedComment));
}

// 댓글 생성
export async function createFeedComment(
  postId: string,
  content: string,
): Promise<CreatedFeedComment> {
  const created = (
    await apiPost<FeedCommentCreateDto>(
      `/api/missions/proofs/${Number(postId)}/comments`,
      { content },
    )
  ).data;
  return toCreatedFeedComment(created);
}
