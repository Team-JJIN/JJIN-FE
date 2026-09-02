/**
 * @module api/shared
 * 여러 도메인(app/_api/<domain>.ts)이 공유하는 DTO↔도메인 mapper와 페이지네이션 타입.
 * 규칙: docs/API-RULE.md §2 (DTO ↔ 도메인 변환 규칙)
 */

// ───────────── 난이도 ─────────────

/** 서버 난이도 enum(대문자) */
export type MissionDifficultyDto = "ONE" | "TWO" | "THREE";

/** 도메인 난이도 — 숫자 리터럴 유니온 */
export type MissionDifficulty = 1 | 2 | 3;

const DIFFICULTY_FROM_DTO: Record<MissionDifficultyDto, MissionDifficulty> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
};

const DIFFICULTY_TO_DTO: Record<MissionDifficulty, MissionDifficultyDto> = {
  1: "ONE",
  2: "TWO",
  3: "THREE",
};

/** 대문자 enum → 숫자 리터럴: Record 매핑 테이블 직접 참조(switch 금지, API-RULE §2) */
export function toDifficulty(dto: MissionDifficultyDto): MissionDifficulty {
  const mapped = DIFFICULTY_FROM_DTO[dto];
  if (mapped === undefined) {
    // 서버 enum이 바뀌어 미지의 값이 오면 undefined가 MissionDifficulty인 척 흘러 별점이 조용히 깨진다 — 1로 폴백하고 개발 모드에서만 경고
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[api/shared] 알 수 없는 난이도 값: ${String(dto)}`);
    }
    return 1;
  }
  return mapped;
}

/** 숫자 리터럴 → 대문자 enum: 요청 바디 작성 시 사용하는 역방향 변환(API-RULE §2) */
export function toDifficultyDto(
  difficulty: MissionDifficulty,
): MissionDifficultyDto {
  return DIFFICULTY_TO_DTO[difficulty];
}

// ───────────── 페이지네이션 ─────────────

/** page/size/hasNext 페이지 메타 — 피드·댓글·미션 목록 등 서버 응답 공통 형태(API-RULE §2) */
export interface PageMetaDto {
  page: number;
  size: number;
  hasNext: boolean;
}

/** 서버 페이지 응답을 앱의 커서 페이지네이션으로 옮긴 도메인 형태 */
export interface Paginated<T> {
  items: T[];
  nextCursor: number | null;
}

/** 서버 {page, hasNext} 페이지를 커서 페이지네이션으로: nextCursor = hasNext ? page+1 : null (API-RULE §2) */
export function toPaginated<T>(meta: PageMetaDto, items: T[]): Paginated<T> {
  return {
    items,
    nextCursor: meta.hasNext ? meta.page + 1 : null,
  };
}

// ───────────── 날짜 ─────────────

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/** 서버 LocalDateTime(타임존 없음)을 KST(+09:00)로 못박은 ISO 문자열로. 이미 오프셋/Z가 있으면 그대로(API-RULE §2) */
export function normalizeServerDate(value: string): string {
  return HAS_ZONE.test(value) ? value : `${value}+09:00`;
}

// ───────────── 쿼리 문자열 ─────────────

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReadonlyArray<string | number>;

/**
 * undefined/null/빈 문자열/빈 배열은 생략, 배열은 반복 키(a=1&a=2, Spring List 바인딩), 값은 encodeURIComponent.
 * client.ts의 apiGet은 path만 받으므로(feature/login-api 기준) 호출부가 `path + buildQuery(q)`로 붙인다.
 * 병합 후 client.ts로 통합 예정 — docs/TODO-api-client.md
 */
export function buildQuery(params: Record<string, QueryValue>): string {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      for (const item of value) {
        pairs.push(
          `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`,
        );
      }
      continue;
    }

    pairs.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  }

  return pairs.length ? `?${pairs.join("&")}` : "";
}
