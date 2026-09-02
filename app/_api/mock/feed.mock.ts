/**
 * @module mock/feed
 * 미션 인증 피드 mock. 서버 계약(DTO) 형태 그대로 보관하고 feed.ts가 실서버와 같은 mapper로 변환한다.
 * - createdAt은 서버와 같은 LocalDateTime(타임존 없음, KST) 문자열 — mapper의 타임존 처리까지 실제 경로로 검증된다.
 * - 조회 함수는 매번 structuredClone 사본을 돌려준다: 모듈 배열 참조를 그대로 주면 mutation의 제자리 수정이
 *   react-query 캐시 객체를 건드려 structural sharing이 "변경 없음"으로 판단, 리렌더가 생략된다.
 * - 실서버 전환 시 이 파일과 feed.ts의 mock import를 함께 제거한다 (docs/API-RULE.md).
 */

import { missionsMock } from "@/app/_api/mock/missions.mock";
import { ApiError } from "@/app/_api/client";
import type { Mission } from "@/app/_api/missions";
import type {
  FeedCommentCreateDto,
  FeedCommentDto,
  FeedCommentPageDto,
  FeedItemDto,
  FeedLikeToggleDto,
  FeedMissionSummaryDto,
  FeedPageDto,
  FeedTabDto,
  MissionDifficultyDto,
} from "@/app/_api/feed";

/** 현재 사용자 (mock 전용). 앱에 아직 프로필(/me) 조회가 없어 댓글 생성 시 작성자 표기에만 쓴다 */
const MOCK_ME = { memberId: 99, nickname: "나" } as const;

/** COMPLETED 탭에 나올 인증글 — "내가 완료한 미션의 인증글"로 가정 (계약 공백 #5) */
const MOCK_COMPLETED_PROOF_IDS = new Set([2, 5, 8]);

const NOT_FOUND_MESSAGE = "미션 인증글을 찾을 수 없습니다.";

/** now 기준 minutes분 전 시각을 서버 LocalDateTime 형식(KST, 타임존 없음)으로 만든다 */
function localDateTimeAgo(
  minutes: number,
  now: number = Date.now(),
): string {
  // sv-SE 로케일은 "YYYY-MM-DD HH:mm:ss" 고정 포맷 — KST로 변환한 뒤 공백만 T로 바꾸면 LocalDateTime
  return new Date(now - minutes * 60_000)
    .toLocaleString("sv-SE", { timeZone: "Asia/Seoul" })
    .replace(" ", "T");
}

const DIFFICULTY_TO_DTO: Record<Mission["difficulty"], MissionDifficultyDto> = {
  1: "ONE",
  2: "TWO",
  3: "THREE",
};

function findMissionOrFirst(missionId: number): Mission {
  return (
    missionsMock.find((m) => m.id === `mission-${missionId}`) ?? missionsMock[0]
  );
}

/** 서버가 피드 item.mission으로 돌려줄 요약 — missionsMock의 값에서 만든다 (제목/난이도 불일치 방지) */
function missionSummary(
  missionId: number,
  weeklyCompletedCount: number,
): FeedMissionSummaryDto {
  const mission = findMissionOrFirst(missionId);
  return {
    missionId,
    title: mission.title,
    difficulty: DIFFICULTY_TO_DTO[mission.difficulty],
    weeklyCompletedCount,
  };
}

/** 피드 item.mission(요약)에 대응하는 전체 Mission 사본 (계약 공백 #1 보강용) */
export function findMockMission(missionId: number): Mission {
  const mission = findMissionOrFirst(missionId);
  return {
    ...mission,
    hashtags: [...mission.hashtags],
    addedPlanIds: [...mission.addedPlanIds],
  };
}

const DAY = 24 * 60;

// commentCount는 아래 syncCommentCounts()가 댓글 mock 개수로 덮는다 (카드 숫자와 목록 길이 불일치 방지)
export const feedItemsMock: FeedItemDto[] = [
  {
    proofId: 1,
    author: { memberId: 1, nickname: "지민", profileImageUrl: null },
    imageUrl: "https://picsum.photos/seed/feed-1/400",
    content:
      "성수 매머드 아인슈페너 크림 진짜 미쳤음. 무너지기 전에 원샷 성공!",
    likeCount: 42,
    commentCount: 0,
    likedByMe: false,
    createdAt: localDateTimeAgo(35),
    mission: missionSummary(1, 128),
  },
  {
    proofId: 2,
    author: {
      memberId: 2,
      nickname: "수아",
      profileImageUrl: "https://picsum.photos/seed/avatar-2/100",
    },
    imageUrl: "https://picsum.photos/seed/feed-2/400",
    content: "스타벅스 슈크림라떼 드디어 마셔봄. 진짜 달달함 폭발이었다 ㅠㅠ",
    likeCount: 31,
    commentCount: 0,
    likedByMe: true,
    createdAt: localDateTimeAgo(3 * 60),
    mission: missionSummary(2, 89),
  },
  {
    proofId: 3,
    author: { memberId: 3, nickname: "하준", profileImageUrl: null },
    imageUrl: "https://picsum.photos/seed/feed-3/400",
    content: "컴포즈 시크릿 메뉴 드디어 완주! 마지막 한 잔이 제일 힘들었다...",
    likeCount: 58,
    commentCount: 0,
    likedByMe: false,
    createdAt: localDateTimeAgo(DAY + 2 * 60),
    mission: missionSummary(3, 47),
  },
  {
    proofId: 4,
    author: {
      memberId: 4,
      nickname: "서연",
      profileImageUrl: "https://picsum.photos/seed/avatar-4/100",
    },
    imageUrl: "https://picsum.photos/seed/feed-4/400",
    content:
      "메가커피 라이트 바닐라 아몬드 라떼 이름 외우다가 하루 다 감ㅋㅋ 맛은 진짜 최고",
    likeCount: 19,
    commentCount: 0,
    likedByMe: false,
    createdAt: localDateTimeAgo(2 * DAY),
    mission: missionSummary(4, 33),
  },
  {
    proofId: 5,
    author: { memberId: 5, nickname: "민준", profileImageUrl: null },
    imageUrl: "https://picsum.photos/seed/feed-5/400",
    content:
      "한라산 정상 백록담 인증 완료! 8시간 산행 진짜 다리 후들후들 ㅋㅋㅋ",
    likeCount: 104,
    commentCount: 0,
    likedByMe: true,
    createdAt: localDateTimeAgo(3 * DAY),
    mission: missionSummary(9, 15),
  },
  {
    proofId: 6,
    author: {
      memberId: 6,
      nickname: "유진",
      profileImageUrl: "https://picsum.photos/seed/avatar-6/100",
    },
    imageUrl: "https://picsum.photos/seed/feed-6/400",
    content: "협재해변 노을 미쳤다... 사진으로는 반도 못 담았지만 그래도 인증!",
    likeCount: 76,
    commentCount: 0,
    likedByMe: false,
    createdAt: localDateTimeAgo(4 * DAY),
    mission: missionSummary(10, 62),
  },
  {
    proofId: 7,
    author: { memberId: 7, nickname: "도윤", profileImageUrl: null },
    imageUrl: "https://picsum.photos/seed/feed-7/400",
    content:
      "광장시장 빈대떡 줄서서 먹었는데 기다린 보람 있었다. 바삭바삭 최고",
    likeCount: 27,
    commentCount: 0,
    likedByMe: false,
    createdAt: localDateTimeAgo(5 * DAY),
    mission: missionSummary(15, 55),
  },
  {
    proofId: 8,
    author: {
      memberId: 8,
      nickname: "채원",
      profileImageUrl: "https://picsum.photos/seed/avatar-8/100",
    },
    imageUrl: "https://picsum.photos/seed/feed-8/400",
    content: "보령 머드축제 온몸이 진흙범벅이지만 인생샷 건졌다 ㅋㅋㅋ",
    likeCount: 65,
    commentCount: 0,
    likedByMe: true,
    createdAt: localDateTimeAgo(6 * DAY),
    mission: missionSummary(17, 71),
  },
  {
    proofId: 9,
    author: { memberId: 9, nickname: "지호", profileImageUrl: null },
    imageUrl: "https://picsum.photos/seed/feed-9/400",
    content: "한강 라이딩 20km 완주! 다리는 아픈데 기분은 날아갈 것 같다",
    likeCount: 38,
    commentCount: 0,
    likedByMe: false,
    createdAt: localDateTimeAgo(8 * DAY),
    mission: missionSummary(19, 24),
  },
  {
    proofId: 10,
    author: {
      memberId: 10,
      nickname: "예은",
      profileImageUrl: "https://picsum.photos/seed/avatar-10/100",
    },
    imageUrl: "https://picsum.photos/seed/feed-10/400",
    content:
      "노포 순대국밥 완밥 성공! 다대기 진짜 얼큰해서 땀 뻘뻘 흘리면서 먹었다",
    likeCount: 22,
    commentCount: 0,
    likedByMe: false,
    createdAt: localDateTimeAgo(12 * DAY),
    mission: missionSummary(5, 40),
  },
];

let nextCommentId = 1;

function comment(
  memberId: number,
  nickname: string,
  content: string,
  minutesAgo: number,
): FeedCommentDto {
  return {
    commentId: nextCommentId++,
    author: { memberId, nickname },
    content,
    createdAt: localDateTimeAgo(minutesAgo),
  };
}

/** proofId → 댓글 목록. 배열은 오래된 순(createdAt 오름차순)으로 유지한다 */
export const feedCommentsMock = new Map<number, FeedCommentDto[]>([
  [
    1,
    [
      // 23개: 무한 스크롤(COMMENT_PAGE_SIZE=20) 확인용
      comment(2, "수아", "크림 무너지기 전에 원샷 인정 ㅋㅋ", 3 * DAY),
      comment(3, "하준", "성수점은 웨이팅 어땠어요?", 2 * DAY + 300),
      comment(1, "지민", "평일 오후라 바로 들어갔어요!", 2 * DAY + 280),
      comment(4, "서연", "저도 내일 도전합니다", DAY),
      comment(6, "유진", "사진 색감 미쳤다", 700),
      ...Array.from({ length: 18 }, (_, i) =>
        comment(
          20 + i,
          `여행러${i + 1}`,
          `${i + 1}번째로 인증 구경하고 갑니다 👀`,
          600 - i * 30,
        ),
      ),
    ],
  ],
  [
    2,
    [
      comment(1, "지민", "슈크림라떼 시즌 한정이라 서둘러야 함", 2 * DAY),
      comment(5, "민준", "저는 너무 달아서 반만 마셨어요 ㅋㅋ", DAY + 120),
      comment(2, "수아", "달달한 게 매력이죠!!", DAY + 90),
    ],
  ],
  [
    3,
    [
      comment(7, "도윤", "시크릿 메뉴 뭐뭐 있었어요?", 20 * 60),
      comment(
        3,
        "하준",
        "총 5종이었는데 마지막 흑임자가 제일 힘들었음",
        19 * 60,
      ),
      comment(8, "채원", "흑임자 라떼 저는 최애인데 ㅠㅠ", 12 * 60),
      comment(9, "지호", "도전해봐야겠다", 8 * 60),
    ],
  ],
  [4, []],
  [
    5,
    [
      comment(6, "유진", "8시간이면 진짜 대단하네요", 2 * DAY + 600),
      comment(10, "예은", "백록담 물 차있었나요?", 2 * DAY + 400),
      comment(5, "민준", "네 이번엔 물이 꽤 있었어요!", 2 * DAY + 380),
    ],
  ],
  [
    6,
    [
      comment(1, "지민", "노을 진짜 예쁘다…", 3 * DAY),
      comment(4, "서연", "협재 노을은 못 참지", 3 * DAY - 120),
    ],
  ],
  [7, [comment(2, "수아", "빈대떡 웨이팅 얼마나 했어요?", 4 * DAY)]],
  [
    8,
    [
      comment(3, "하준", "머드 자국 3일 갔다는 소문이", 5 * DAY),
      comment(8, "채원", "ㅋㅋㅋ 이틀이면 지워져요", 5 * DAY - 60),
    ],
  ],
  [9, [comment(5, "민준", "다음엔 같이 타요", 7 * DAY)]],
  [10, []],
]);

function syncCommentCounts() {
  for (const item of feedItemsMock) {
    item.commentCount = feedCommentsMock.get(item.proofId)?.length ?? 0;
  }
}
syncCommentCounts();

function findItem(proofId: number): FeedItemDto {
  const item = feedItemsMock.find((p) => p.proofId === proofId);
  if (!item) throw new ApiError(404, NOT_FOUND_MESSAGE);
  return item;
}

/** GET 피드 조회 응답 mock */
export function mockFeedPage(
  tab: FeedTabDto,
  page: number,
  size: number,
): FeedPageDto {
  let items: FeedItemDto[];
  switch (tab) {
    case "POPULAR":
      items = [...feedItemsMock].sort((a, b) => b.likeCount - a.likeCount);
      break;
    case "WEEKLY_HOT":
      items = [...feedItemsMock].sort(
        (a, b) =>
          b.mission.weeklyCompletedCount - a.mission.weeklyCompletedCount,
      );
      break;
    case "COMPLETED":
      items = feedItemsMock.filter((p) =>
        MOCK_COMPLETED_PROOF_IDS.has(p.proofId),
      );
      break;
    default:
      // LocalDateTime은 자릿수가 고정된 같은 포맷이라 문자열 비교 = 시각 비교
      items = [...feedItemsMock].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt),
      );
  }
  const start = page * size;
  return {
    tab,
    page,
    size,
    hasNext: start + size < items.length,
    items: structuredClone(items.slice(start, start + size)),
  };
}

/** POST 좋아요 토글 응답 mock */
export function mockToggleLike(proofId: number): FeedLikeToggleDto {
  const item = findItem(proofId);
  item.likedByMe = !item.likedByMe;
  item.likeCount += item.likedByMe ? 1 : -1;
  return { proofId, liked: item.likedByMe, likeCount: item.likeCount };
}

/** GET 댓글 조회 응답 mock */
export function mockCommentPage(
  proofId: number,
  page: number,
  size: number,
): FeedCommentPageDto {
  // 존재하지 않는 글이면 404
  findItem(proofId);
  const all = feedCommentsMock.get(proofId) ?? [];
  const start = page * size;
  return {
    proofId,
    page,
    size,
    hasNext: start + size < all.length,
    comments: structuredClone(all.slice(start, start + size)),
  };
}

/** POST 댓글 생성 응답 mock */
export function mockCreateComment(
  proofId: number,
  content: string,
): FeedCommentCreateDto {
  const item = findItem(proofId);
  const created = comment(MOCK_ME.memberId, MOCK_ME.nickname, content, 0);
  const list = feedCommentsMock.get(proofId) ?? [];
  list.push(created);
  feedCommentsMock.set(proofId, list);
  item.commentCount = list.length;
  return {
    commentId: created.commentId,
    proofId,
    content,
    timeAgo: "방금 전",
    createdAt: created.createdAt,
    commentCount: item.commentCount,
  };
}
