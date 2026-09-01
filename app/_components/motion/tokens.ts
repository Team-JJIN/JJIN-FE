/**
 * @module motion/tokens
 * 모션 수치 단일 보관소. 컴포넌트에 duration/easing 매직넘버를 직접 쓰지 말 것.
 *
 * CSS(Tailwind) 탭 피드백 관례:
 * - 칩/작은 버튼: `motion-safe:active:scale-[0.96]`, 큰 버튼: `motion-safe:active:scale-[0.98]`
 * - disabled 있는 버튼은 `motion-safe:active:enabled:scale-*`
 * - 기존 `transition-colors` → `transition`으로 교체해 transform도 전환 대상에 포함 (duration-150 유지)
 * - chevron 회전: `transition-transform duration-200 motion-reduce:transition-none` + 조건부 `rotate-180`
 */
import type { Transition, Variants } from "framer-motion";

export const DUR = { xs: 0.12, sm: 0.18, md: 0.25, lg: 0.3 } as const;
// md = PageTransition(0.25s), lg = BottomSheet(0.3s) 기존 관례와 동일

export const EASE = {
  out: "easeOut",
  page: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
} as const;

export const STAGGER = {
  sectionBase: 0.05,
  sectionStep: 0.06,
  listStep: 0.05,
  listCap: 6,
} as const;

/** 페이지 섹션 순차 등장. opacityOnly는 스크롤러/absolute 자식을 품은 섹션용 (transform 금지 지점) */
export function sectionEnter(order: number, opacityOnly = false) {
  return {
    initial: opacityOnly ? { opacity: 0 } : { opacity: 0, y: 10 },
    animate: opacityOnly ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: {
      duration: DUR.md,
      ease: EASE.out,
      delay: STAGGER.sectionBase + order * STAGGER.sectionStep,
    } satisfies Transition,
  };
}

/** 리스트 아이템 등장. index >= listCap이면 delay 0 (무한스크롤 append는 가벼운 fade만) */
export function listItemEnter(index: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: DUR.md,
      ease: EASE.out,
      delay: index < STAGGER.listCap ? index * STAGGER.listStep : 0,
    } satisfies Transition,
  };
}

/** 로딩/에러/빈/리스트 상태 교체 크로스페이드 (AnimatePresence mode="wait" 용) */
export const fadeSwap = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: DUR.sm, ease: EASE.out } },
  exit: { opacity: 0, transition: { duration: DUR.xs, ease: EASE.out } },
} as const;

/** 오버레이 딤 배경 */
export const dimFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: EASE.out } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: EASE.out } },
} as const;

/** 중앙 패널 (Dialog) */
export const centerPanel = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.22, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.15, ease: EASE.out },
  },
} as const;

/** 앵커 팝오버 (SortPopover). transform-origin은 호출부 className으로 지정 */
export const popover = {
  initial: { opacity: 0, scale: 0.95, y: -4 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.16, ease: EASE.out },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -4,
    transition: { duration: 0.12, ease: EASE.out },
  },
} as const;

/**
 * 바텀시트 내부 가로 스텝 전환 (MissionSheet detail↔add). custom = 진행 방향(1: 앞으로, -1: 뒤로).
 * opacity를 함께 두는 이유: reducedMotion="user"에서 transform이 꺼져도 크로스페이드로 전환이 보이도록.
 */
export const slideStep = {
  enter: (dir: 1 | -1) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: DUR.md, ease: EASE.page },
  },
  exit: (dir: 1 | -1) => ({
    x: dir > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: DUR.md, ease: EASE.page },
  }),
} as const;

/** 탭 밑줄 인디케이터 layoutId 이동 (MissionFeedPage 탭바) */
export const tabIndicator: Transition = {
  type: "tween",
  duration: DUR.md,
  ease: EASE.page,
};

/**
 * 좋아요 하트 펄스. `initial={false} animate={liked ? "liked" : "idle"}`로 쓰면
 * 켜질 때만 1→1.3→1로 튀고, 첫 렌더·해제는 정적이다.
 */
export const heartPop: Variants = {
  idle: { scale: 1 },
  liked: {
    scale: [1, 1.3, 1],
    transition: { duration: DUR.md, ease: EASE.out, times: [0, 0.4, 1] },
  },
};

/** whileTap 프리셋 (파일이 이미 framer를 쓸 때만 사용, 아니면 CSS 관례 사용) */
export const TAP = {
  button: { scale: 0.97 },
  card: { scale: 0.98 },
  icon: { scale: 0.9 },
} as const;
