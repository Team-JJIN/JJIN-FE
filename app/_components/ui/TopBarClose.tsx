/**
 * @component TopBarClose
 * 제목(왼쪽) + X 닫기(오른쪽). 바텀시트 상단용.
 * onBack이 전달되면 제목 왼쪽에 ← 버튼이 붙는다. ←는 "시트 내부 스텝 되돌리기"용이고
 * ✕는 언제나 "시트 전체 닫기"라 서로 다른 동작이다.
 * 좌측 그룹(←+제목)은 AnimatePresence mode="wait"로 감싸, 스텝 전환으로 제목/← 유무가
 * 바뀔 때 텍스트가 툭 갈리지 않고 크로스페이드되게 한다.
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowBackIcon } from "@/app/_components/icons";
import { fadeSwap } from "@/app/_components/motion/tokens";

interface TopBarCloseProps {
  title: string;
  onClose: () => void;
  /** X 버튼의 접근 가능한 이름. 미전달 시 기존처럼 라벨 없음(호출부에서 t("close") 전달 권장) */
  closeLabel?: string;
  /** 전달 시 제목 왼쪽에 ← 버튼을 노출한다 (시트 내부 스텝 뒤로가기, 닫기 아님) */
  onBack?: () => void;
  /** ← 버튼의 접근 가능한 이름 */
  backLabel?: string;
  /** 댓글 시트처럼 낮은 헤더용: 제목 15px, 행 최소 높이 24px */
  compact?: boolean;
  /** 기본 제목 스타일을 덮어쓸 클래스 (default 헤더에서만 적용) */
  titleClassName?: string;
}

export default function TopBarClose({
  title,
  onClose,
  closeLabel,
  onBack,
  backLabel,
  compact = false,
  titleClassName,
}: TopBarCloseProps) {
  return (
    // min-h: h2(27px, compact는 15px 타이틀 기준 24px)와 ✕(22px)의 높이 차 때문에 ←/제목이 교체될 때 행 높이가 흔들리는 것을 막는다
    <div
      className={`flex items-center justify-between ${compact ? "min-h-[24px]" : "min-h-[28px]"}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${onBack ? "back" : "plain"}:${title}`}
          className="flex items-center gap-1"
          {...fadeSwap}
        >
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={backLabel}
              className="-ml-1 flex size-[28px] shrink-0 items-center justify-center text-[#171717] transition duration-150 motion-safe:active:scale-90"
            >
              <ArrowBackIcon size={20} />
            </button>
          )}
          <h2
            className={
              compact
                ? "text-[15px] font-semibold tracking-[-0.045px] text-ink"
                : titleClassName ?? "text-[18px] font-semibold text-[#171717]"
            }
          >
            {title}
          </h2>
        </motion.div>
      </AnimatePresence>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="text-[22px] text-neutral-400 leading-none transition duration-150 motion-safe:active:scale-90"
      >
        ✕
      </button>
    </div>
  );
}
