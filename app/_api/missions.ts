/**
 * 미션(M1) 도메인 API 함수들. 현재 mock 데이터 반환.
 * 추후 apiGet/apiPost로 교체하면 백엔드 연결 완료.
 * (주의: client.ts에는 아직 apiGet이 없음 — 백엔드 연동 시 GET 클라이언트 추가 필요)
 */

import { missionsMock, myPlansMock } from "./mock/missions.mock";

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
  addedPlanIds: string[]; // 이 미션을 담은 일정 id 목록 (한 미션을 여러 일정에 담을 수 있음)
  isMine: boolean;
}

export interface MyPlan {
  id: string;
  title: string;
  dateStart: string;
  dateEnd: string;
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
  return { ...m, hashtags: [...m.hashtags], addedPlanIds: [...m.addedPlanIds] };
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
    addedPlanIds: [],
    isMine: true,
  };

  missionsMock.unshift(newMission);
  return cloneMission(newMission);
}

export interface MissionLike {
  likeId: string;
  planId: string;
}

// 미션을 담을 일정 목록을 통째로 설정한다 (set 의미: 목록에 없는 일정은 해제).
// 추후: return (await apiPost<{ likes: MissionLike[] }>(`/api/missions/${missionId}/likes`, { planIds: planIds.map(Number) })).data;  (응답 planId는 String()으로 변환)
export async function setMissionPlans(
  missionId: string,
  planIds: string[],
): Promise<{ likes: MissionLike[] }> {
  await delay(300);

  const mission = missionsMock.find((m) => m.id === missionId);
  if (mission) {
    mission.isAdded = planIds.length > 0;
    mission.addedPlanIds = [...planIds];
  }

  const likes: MissionLike[] = mission
    ? planIds.map((planId) => ({
        likeId: `like-${missionId}-${planId}`,
        planId,
      }))
    : [];
  return { likes };
}
