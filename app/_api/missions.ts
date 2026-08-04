/**
 * 미션(M1) 도메인 API 함수들. 현재 mock 데이터 반환.
 * 추후 apiGet/apiPost로 교체하면 백엔드 연결 완료.
 * (주의: client.ts에는 아직 apiGet이 없음 — 백엔드 연동 시 GET 클라이언트 추가 필요)
 */

import { missionsMock, myPlansMock, feedPostsMock } from "./mock/missions.mock";

export type MissionDifficulty = 1 | 2 | 3;

export type MissionCategory =
  | "food"
  | "experience"
  | "nature"
  | "history"
  | "culture"
  | "shopping"
  | "festival"
  | "leisure";

export type MissionFilter = "all" | "mustDo" | "hot" | "mine";

export type MissionSort = "popular" | "latest";

export type FeedTab = "latest" | "popular" | "weeklyHot";

export interface Mission {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  difficulty: MissionDifficulty;
  category: MissionCategory;
  // UGC 자유 문자열 — 번역 대상 아님. 프리셋 칩 선택 시 표시 언어의 라벨이 그대로 저장됨(다국어 태그 공존은 의도된 동작)
  hashtags: string[];
  isAdded: boolean;
  addedPlanId: string | null;
  isMine: boolean;
}

export interface MyPlan {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string;
}

export interface FeedPost {
  id: string;
  author: { nickname: string; avatarUrl: string | null };
  imageUrl: string;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  commentCount: number;
  weeklyClearCount: number;
  mission: Mission;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: number | null;
}

export interface CreateMissionInput {
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  hashtags: string[];
  imageUrl: string | null;
}

const MISSION_PAGE_SIZE = 5;
const SEARCH_PAGE_SIZE = 6;
const FEED_PAGE_SIZE = 3;

// mock 전용 id 충돌 방지 카운터. 동일 밀리초에 여러 미션이 생성돼도 id가 겹치지 않도록 병용한다.
let missionIdSeq = 0;

// --- 유틸 ---
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// mock 전용: 조회 결과를 사본으로 반환한다.
// 실제 API는 매 응답이 새로 역직렬화된 객체지만, mock은 모듈 배열의 참조를 그대로
// 돌려주면 mutation의 제자리 수정이 react-query 캐시와 같은 객체를 건드려
// 구조 공유(structural sharing)가 "변경 없음"으로 판단해 리렌더가 생략된다.
// API 전환 시 이 복사 계층은 fetch 함수들과 함께 제거하면 된다.
function cloneMission(m: Mission): Mission {
  return { ...m, hashtags: [...m.hashtags] };
}

function cloneFeedPost(p: FeedPost): FeedPost {
  return { ...p, author: { ...p.author }, mission: cloneMission(p.mission) };
}

function paginate<T>(
  items: T[],
  cursor: number,
  pageSize: number,
): Paginated<T> {
  const start = cursor * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  const hasMore = start + pageSize < items.length;
  return { items: pageItems, nextCursor: hasMore ? cursor + 1 : null };
}

// 미션 추천 목록 (필터별)
export async function fetchMissions({
  filter,
  cursor,
}: {
  filter: MissionFilter;
  cursor: number;
}): Promise<Paginated<Mission>> {
  // 추후: return (await apiGet<Paginated<Mission>>(`/api/missions?filter=${filter}&cursor=${cursor}`)).data;
  await delay(400);

  let filtered: Mission[];
  switch (filter) {
    case "mustDo":
      // 꼭 해봐야 할 = 난이도 3(고난이도) 또는 인기 상위 흉내(앞쪽 노출 미션)
      filtered = missionsMock.filter((m, i) => m.difficulty === 3 || i < 4);
      break;
    case "hot":
      // 요즘 핫한 = 최근 생성 흉내 (배열 뒤쪽일수록 최근 추가된 것으로 간주해 역순 노출)
      filtered = [...missionsMock].reverse();
      break;
    case "mine":
      filtered = missionsMock.filter((m) => m.isMine);
      break;
    default:
      filtered = missionsMock;
  }

  const page = paginate(filtered, cursor, MISSION_PAGE_SIZE);
  return { ...page, items: page.items.map(cloneMission) };
}

// 미션 검색 (검색어/카테고리/난이도/정렬)
export async function searchMissions({
  query,
  categories,
  difficulty,
  sort,
  cursor,
}: {
  query: string;
  categories: MissionCategory[];
  difficulty: MissionDifficulty | null;
  sort: MissionSort;
  cursor: number;
}): Promise<Paginated<Mission> & { totalCount: number }> {
  // 추후: return (await apiGet<Paginated<Mission> & { totalCount: number }>("/api/missions/search", { params: {...} })).data;
  await delay(400);

  const q = query.trim().toLowerCase();

  let filtered = missionsMock.filter((m) => {
    const matchesQuery =
      q === "" ||
      m.title.toLowerCase().includes(q) ||
      m.hashtags.some((h) => h.toLowerCase().includes(q));
    const matchesCategory =
      categories.length === 0 || categories.includes(m.category);
    const matchesDifficulty =
      difficulty === null || m.difficulty === difficulty;
    return matchesQuery && matchesCategory && matchesDifficulty;
  });

  filtered = sort === "latest" ? [...filtered].reverse() : filtered;

  const { items, nextCursor } = paginate(filtered, cursor, SEARCH_PAGE_SIZE);
  return {
    items: items.map(cloneMission),
    nextCursor,
    totalCount: filtered.length,
  };
}

// 내 일정 목록
export async function fetchMyPlans(): Promise<MyPlan[]> {
  // 추후: return (await apiGet<MyPlan[]>("/api/plans/my")).data;
  await delay(300);
  return myPlansMock.map((p) => ({ ...p }));
}

// 미션 생성
export async function createMission(
  input: CreateMissionInput,
): Promise<Mission> {
  // 추후: return (await apiPost<Mission>("/api/missions", input)).data;
  await delay(500);

  const newMission: Mission = {
    id: `mission-${Date.now()}-${missionIdSeq++}`,
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl,
    difficulty: input.difficulty,
    // TODO: 생성 폼에 카테고리 입력 없음 — 실서버 연동 시 서버 분류 or 폼 추가 결정
    category: "food",
    hashtags: [...input.hashtags],
    isAdded: false,
    addedPlanId: null,
    isMine: true,
  };

  missionsMock.unshift(newMission);
  return cloneMission(newMission);
}

// 미션을 내 일정에 추가
export async function addMissionToPlan(
  missionId: string,
  planId: string,
): Promise<void> {
  // 추후: await apiPost(`/api/missions/${missionId}/add`, { planId });
  await delay(300);

  const mission = missionsMock.find((m) => m.id === missionId);
  if (mission) {
    mission.isAdded = true;
    mission.addedPlanId = planId;
  }
}

// 미션 추가 취소
export async function removeMissionFromPlan(missionId: string): Promise<void> {
  // 추후: await apiPost(`/api/missions/${missionId}/remove`, {});
  await delay(300);

  const mission = missionsMock.find((m) => m.id === missionId);
  if (mission) {
    mission.isAdded = false;
    mission.addedPlanId = null;
  }
}

// 미션 인증 피드
export async function fetchFeed({
  tab,
  cursor,
}: {
  tab: FeedTab;
  cursor: number;
}): Promise<Paginated<FeedPost>> {
  // 추후: return (await apiGet<Paginated<FeedPost>>(`/api/missions/feed?tab=${tab}&cursor=${cursor}`)).data;
  await delay(400);

  let sorted: FeedPost[];
  switch (tab) {
    case "popular":
      sorted = [...feedPostsMock].sort((a, b) => b.likeCount - a.likeCount);
      break;
    case "weeklyHot":
      sorted = [...feedPostsMock].sort(
        (a, b) => b.weeklyClearCount - a.weeklyClearCount,
      );
      break;
    default:
      sorted = [...feedPostsMock].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }

  const page = paginate(sorted, cursor, FEED_PAGE_SIZE);
  return { ...page, items: page.items.map(cloneFeedPost) };
}

// 피드 좋아요 토글
export async function toggleFeedLike(
  postId: string,
  liked: boolean,
): Promise<void> {
  // 추후: await apiPost(`/api/missions/feed/${postId}/like`, { liked });
  await delay(300);

  const post = feedPostsMock.find((p) => p.id === postId);
  if (post && post.likedByMe !== liked) {
    post.likeCount += liked ? 1 : -1;
    post.likedByMe = liked;
  }
}
