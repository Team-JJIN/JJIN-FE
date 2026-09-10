/**
 * @component PlaceCard
 * 장소 카드. variant(read/edit/selected)에 따라 표시 내용과 높이가 달라진다.
 * 높이 전환은 framer `layout`(scale 기반 — 자식 글자·타임라인 원이 찌그러지고 첫 프레임이 깜빡인다)
 * 대신 안쪽 내용 상자의 실제 높이를 ResizeObserver로 재서 바깥 상자의 `height`를 트윈한다.
 * 실제 레이아웃이 매 프레임 바뀌므로 왼쪽 타임라인 점선(flex stretch)도 자연히 따라 늘어난다.
 * 선택 테두리는 `ring-inset`(box-shadow) — border는 1px만큼 높이에 끼어들어 측정값과 어긋난다.
 * read/selected에서는 이름·영업시간·주소 블록을 motion.button으로 감싸 탭하면
 * onToggleSelect가 호출되어(같은 카드 재탭 시 해제) selected로 토글된다 — 길찾기 버튼은
 * 이 버튼의 형제로 남겨 버튼 중첩을 피한다. edit에서는 탭 불가능한 div로 대체한다.
 * 삭제 영역·업종·길찾기는 각각 독립된 AnimatePresence로 감싸(항상 마운트 유지) variant가
 * 바뀔 때 크로스페이드되도록 한다 — 조건부로 AnimatePresence 자체를 마운트/언마운트하면
 * exit 애니메이션이 실행되지 않는다. 삭제·길찾기는 mode="popLayout"으로 퇴장 즉시 흐름에서
 * 빼(absolute 고정) 안쪽 높이가 한 번에 줄고 바깥 상자가 그 위를 덮으며 접히게 한다 —
 * 흐름에 남겨 두면 gap·min-h 변화와 퇴장 완료가 두 단계로 나뉘어 높이가 두 번 움직인다.
 */
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { DragControls } from "framer-motion";
import { useTranslations } from "next-intl";
import { fadeSwap, layoutShift, TAP } from "@/app/_components/motion/tokens";
import { DragHandleIcon } from "@/app/_components/icons";
import type { PlanPlace, PlaceCardVariant } from "../../_types";

interface PlaceCardProps {
  place: PlanPlace;
  variant: PlaceCardVariant;
  dragControls?: DragControls;
  isDragging?: boolean;
  onDelete?: (id: string) => void;
  onDirections?: (place: PlanPlace) => void;
  onToggleSelect?: () => void;
}

/**
 * 안쪽 내용 상자의 border-box 높이를 추적한다. 첫 측정 전엔 null(바깥 상자는 auto로 둔다).
 * borderBoxSize는 transform과 무관한 레이아웃 크기라 드래그 중 scale 영향을 받지 않는다.
 */
function useContentHeight() {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, height] as const;
}

// isEdit/read 갈래가 공유하는 이름+영업시간+주소 정보 블록.
// 모듈 최상위에 정의해야 한다 — 컴포넌트 함수 안에 정의하면 매 렌더마다 새 컴포넌트 타입이 되어
// AnimatePresence가 깨진다.
interface PlaceCardBodyProps {
  place: PlanPlace;
  hoursLine: string | null;
  trailing: React.ReactNode;
}

function PlaceCardBody({ place, hoursLine, trailing }: PlaceCardBodyProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-[1.4] tracking-[-0.045px] text-ink">
          <span className="sr-only">{place.order}. </span>
          {place.name}
        </h3>
        {trailing}
      </div>
      {hoursLine && (
        <p className="mt-1 text-[12px] font-medium leading-[1.6] text-subtext">
          {hoursLine}
        </p>
      )}
      <p className="mt-1 text-[12px] font-medium leading-[1.6] text-subtext">
        {place.address}
      </p>
    </>
  );
}

export default function PlaceCard({
  place,
  variant,
  dragControls,
  isDragging,
  onDelete,
  onDirections,
  onToggleSelect,
}: PlaceCardProps) {
  const t = useTranslations("plan");
  const reduceMotion = useReducedMotion();
  const [contentRef, contentHeight] = useContentHeight();

  const isEdit = variant === "edit";
  const isSelected = variant === "selected";

  let hoursLine: string | null = null;
  if (place.isOpen !== null) {
    const status = place.isOpen ? t("open") : t("closed");
    hoursLine = place.openHours
      ? `${status} | ${place.openHours.start} - ${place.openHours.end}`
      : status;
  }

  const sizeClasses = isEdit
    ? "min-h-[153px] p-4 flex flex-col gap-[23px]"
    : isSelected
      ? "min-h-[153px] p-4 flex flex-col gap-[10px]"
      : "min-h-[93px] p-4";

  const surfaceClasses = isDragging
    ? "shadow-[0_8px_24px_rgba(23,23,23,0.16)]"
    : isSelected
      ? "ring-1 ring-inset ring-lime-vivid shadow-[0_2px_6px_#f4ffd6]"
      : "shadow-[0_2px_6px_rgba(23,23,23,0.06)]";

  return (
    <motion.div
      initial={false}
      animate={{ height: contentHeight ?? "auto" }}
      transition={{ height: reduceMotion ? { duration: 0 } : layoutShift }}
      className={`min-w-0 flex-1 overflow-hidden rounded-[14px] bg-white transition-[box-shadow] duration-150 ${surfaceClasses}`}
    >
      <div ref={contentRef} className={`relative ${sizeClasses}`}>
        {isEdit ? (
          <div>
            <PlaceCardBody
              place={place}
              hoursLine={hoursLine}
              trailing={
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={t("reorder")}
                  onPointerDown={(e) => dragControls?.start(e)}
                  style={{ touchAction: "none" }}
                  className="flex size-6 shrink-0 cursor-grab items-center justify-center text-subtext active:cursor-grabbing"
                >
                  <DragHandleIcon size={24} />
                </button>
              }
            />
          </div>
        ) : (
          <motion.button
            type="button"
            aria-pressed={isSelected}
            whileTap={TAP.card}
            onClick={onToggleSelect}
            className="block w-full text-left"
          >
            <PlaceCardBody
              place={place}
              hoursLine={hoursLine}
              trailing={
                <AnimatePresence initial={false}>
                  {place.category && (
                    <motion.span
                      key="category"
                      {...fadeSwap}
                      className="shrink-0 text-[12px] font-medium leading-[1.6] text-muted"
                    >
                      {place.category}
                    </motion.span>
                  )}
                </AnimatePresence>
              }
            />
          </motion.button>
        )}

        <AnimatePresence initial={false} mode="popLayout">
          {isEdit && (
            <motion.div
              key="delete"
              {...fadeSwap}
              className="flex justify-center border-t border-line pt-[11px]"
            >
              <motion.button
                type="button"
                whileTap={TAP.button}
                onClick={() => onDelete?.(place.id)}
                className="px-4 text-[14px] font-medium leading-[1.6] text-[#ff008c]"
              >
                {t("delete")}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false} mode="popLayout">
          {isSelected && (
            <motion.button
              key="directions"
              {...fadeSwap}
              type="button"
              whileTap={TAP.button}
              onClick={() => onDirections?.(place)}
              className="h-12 w-full rounded-2xl bg-dark text-[15px] font-semibold leading-[1.4] text-lime-vivid"
            >
              {t("directions")}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
