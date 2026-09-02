/**
 * @component MissionSheet
 * 미션 상세 ↔ 미션 추가를 한 바텀시트 안에서 가로 슬라이드로 오가는 통합 시트.
 * useMissionSheetStore의 missionId가 non-null이면 열리고, step이 어떤 화면을 보여줄지 정한다.
 *
 * 구조·결정 메모
 * - 딤/ESC/✕/포커스트랩은 전부 BottomSheet가 담당하고, 여기서는 "어떤 스텝을 보여줄지"만 다룬다.
 *   헤더의 ←(onBack)는 상세에서 들어온 추가 화면에서만 뜨며 시트를 닫지 않는다.
 *   AddMissionPanel의 취소(onCancel)는 ←와 달리 시트 전체 닫기다.
 * - AnimatePresence에 mode를 주지 않는(sync) 이유: 두 스텝이 동시에 존재해야 나가는 화면과
 *   들어오는 화면이 겹쳐서 함께 밀려나는 "화면 전환"처럼 보인다. mode="wait"면 하나가 사라진
 *   뒤에야 다음이 들어와 슬라이드가 끊긴다. 겹치려면 두 pane 모두 absolute여야 한다.
 * - custom(진행 방향)은 AnimatePresence와 motion.div 양쪽에 준다. 떠나는 pane은 이미 언마운트
 *   대상이라 자기 props가 갱신되지 않으므로, AnimatePresence 쪽 custom이 그 pane의 exit
 *   variant로 전달돼야 방향이 맞는다.
 * - 닫힘 exit 모션 동안 콘텐츠를 유지하는 책임은 store에 있다: close()는 open만 내리고
 *   missionId/preview/step/entry를 그대로 두므로 여기서 별도 미러가 필요 없다.
 * - inner 래퍼의 key={`${missionId}:${openSeq}`}: 오픈 단위로 콘텐츠를 통째로 리마운트한다.
 *   missionId만 key로 쓰면, exit 모션(300ms) 도중 같은 미션을 다시 열 때 BottomSheet의
 *   AnimatePresence가 서브트리를 언마운트하지 않아 AddMissionPanel의 로컬 선택(useState)이
 *   이전 오픈 그대로 살아남는다 — "취소하면 로컬 토글은 버려진다"는 계약이 깨지고, 그 상태로
 *   '추가하기'를 누르면 담겨 있던 일정이 해제된다. openSeq가 그 창을 닫는다.
 * - 상세 스텝은 useMissionDetail(missionId)을 구독해 로딩/에러/성공 세 상태를 그린다. preview는
 *   상세 응답이 오기 전 헤더 제목(및 add 진입 시 요약 카드)을 즉시 그리기 위한 값일 뿐이다.
 * - 일정 추가 화면에서 쓸 찜 목록은 useMissionPlanLikes(missionId)을 시트가 열릴 때 함께
 *   프리페치한다 — AddMissionPanel이 같은 쿼리 키로 다시 구독하면 캐시를 그대로 재사용한다.
 */
"use client";

import { useCallback, useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import { slideStep } from "@/app/_components/motion/tokens";
import { useMissionSheetStore } from "../_store/useMissionSheetStore";
import {
  useMissionDetail,
  useMissionPlanLikes,
} from "../_hooks/useMissionQueries";
import type { MissionDetail } from "@/app/_api/missions";
import type { UseQueryResult } from "@tanstack/react-query";
import AddMissionPanel from "./AddMissionPanel";
import MissionDetailPanel from "./MissionDetailPanel";

/**
 * 스텝 하나를 감싸는 래퍼. sync AnimatePresence에서는 나가는 pane이 잠시 화면에 남아 있어
 * 그 위의 버튼이 여전히 클릭·탭 포커스를 받을 수 있으므로, 퇴장 중인 pane은 inert로 막는다.
 * 포커스 이동 대상이 되도록 tabIndex={-1}을 준다.
 */
function StepPane({
  paneRef,
  children,
}: {
  paneRef: (node: HTMLDivElement | null) => void;
  children: React.ReactNode;
}) {
  const isPresent = useIsPresent();

  return (
    <div
      ref={paneRef}
      tabIndex={-1}
      inert={!isPresent}
      aria-hidden={isPresent ? undefined : true}
      className="h-full"
    >
      {children}
    </div>
  );
}

/** 상세 조회 로딩 중 보여줄 스켈레톤. 이미지 블록 + 별점 줄 + 본문 2~3줄 정도로 실제 패널과 높이를 맞춘다 */
function MissionDetailSkeleton() {
  return (
    <div className="h-full overflow-y-auto overscroll-contain scrollbar-hide px-[20px] pb-8">
      <div className="aspect-[343/387] w-full animate-pulse rounded-[12px] bg-surface" />
      <div className="mt-[17px] flex items-center justify-between gap-2">
        <div className="h-[16px] w-[72px] animate-pulse rounded-full bg-surface" />
        <div className="h-[32px] w-[74px] animate-pulse rounded-full bg-surface" />
      </div>
      <div className="mt-[21px] flex flex-col gap-2">
        <div className="h-[14px] w-full animate-pulse rounded-full bg-surface" />
        <div className="h-[14px] w-full animate-pulse rounded-full bg-surface" />
        <div className="h-[14px] w-2/3 animate-pulse rounded-full bg-surface" />
      </div>
    </div>
  );
}

/** 상세 조회 실패 시 보여줄 재시도 화면 */
function MissionDetailErrorState({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("mission");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-[20px]">
      <p className="text-[13px] font-medium text-subtext">
        {t("sheet.loadError")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-dark px-4 py-2 text-[12px] font-semibold text-white transition duration-150 motion-safe:active:scale-[0.97]"
      >
        {t("retry")}
      </button>
    </div>
  );
}

/** 상세 스텝 콘텐츠. 로딩/에러/성공 세 상태를 detail 쿼리 결과로 분기한다 */
function MissionDetailStep({
  detail,
  onAddClick,
}: {
  detail: UseQueryResult<MissionDetail>;
  onAddClick: () => void;
}) {
  if (detail.data) {
    return <MissionDetailPanel detail={detail.data} onAddClick={onAddClick} />;
  }
  if (detail.isError) {
    return <MissionDetailErrorState onRetry={() => detail.refetch()} />;
  }
  return <MissionDetailSkeleton />;
}

export default function MissionSheet() {
  const t = useTranslations("mission");

  const open = useMissionSheetStore((s) => s.open);
  const missionId = useMissionSheetStore((s) => s.missionId);
  const preview = useMissionSheetStore((s) => s.preview);
  const openSeq = useMissionSheetStore((s) => s.openSeq);
  const step = useMissionSheetStore((s) => s.step);
  const entry = useMissionSheetStore((s) => s.entry);
  const goToAdd = useMissionSheetStore((s) => s.goToAdd);
  const goBackToDetail = useMissionSheetStore((s) => s.goBackToDetail);
  const close = useMissionSheetStore((s) => s.close);

  const detail = useMissionDetail(missionId, open);
  // 일정 추가 화면에서 쓸 찜 목록을 시트가 열릴 때 함께 프리페치한다.
  // 결과는 AddMissionPanel이 같은 훅으로 캐시에서 읽는다.
  useMissionPlanLikes(missionId, open);

  // 스텝 전환 시 새 pane으로 포커스를 옮긴다. 퇴장 중인 pane이 언마운트될 때 실행되는
  // ref 콜백(null)이 새 pane 참조를 지우지 않도록 non-null일 때만 기록한다.
  const paneRef = useRef<HTMLDivElement | null>(null);
  const setPaneRef = useCallback((node: HTMLDivElement | null) => {
    if (node) paneRef.current = node;
  }, []);

  // useLayoutEffect인 이유: 커밋에서 이전 pane이 inert가 되는 순간 그 안에 있던 포커스가
  // body로 떨어진다. passive effect면 페인트 뒤에야 새 pane으로 옮기므로 포커스가 body에
  // 머무는 프레임이 생긴다. openSeq를 deps에 넣어 같은 step으로 재오픈해도 pane에 포커스한다.
  useLayoutEffect(() => {
    // preventScroll: 시트가 아직 화면 아래에 있는 등장 모션 중에 스크롤이 튀지 않게 한다
    paneRef.current?.focus({ preventScroll: true });
  }, [step, openSeq]);

  if (!missionId || !preview) return null;

  const showBack = entry === "detail" && step === "add";
  // 스텝이 둘뿐이라 "어디로 가는가"만으로 방향이 결정된다 (add=앞으로, detail=뒤로)
  const direction: 1 | -1 = step === "add" ? 1 : -1;

  return (
    <BottomSheet
      open={open}
      // 상세 스텝의 헤더 제목은 미션 제목 자체다 (디자인 685:2251). 상세 응답 도착 전에도
      // preview.title로 즉시 그린다. 본문에는 제목을 다시 쓰지 않는다.
      title={step === "detail" ? preview.title : t("add.title")}
      onClose={close}
      closeLabel={t("close")}
      onBack={showBack ? goBackToDetail : undefined}
      backLabel={t("back")}
      animated
      contentMode="fill"
    >
      <div key={`${missionId}:${openSeq}`} className="relative h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideStep}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 flex flex-col"
          >
            <StepPane paneRef={setPaneRef}>
              {step === "detail" ? (
                <MissionDetailStep detail={detail} onAddClick={goToAdd} />
              ) : (
                <AddMissionPanel
                  missionId={missionId}
                  preview={preview}
                  active={open}
                  onDone={close}
                  onCancel={close}
                />
              )}
            </StepPane>
          </motion.div>
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
}
