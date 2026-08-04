/**
 * @component MissionDetailPopup
 * 미션 상세 정보를 보여주는 중앙 팝업. 딤 배경 탭 또는 우상단 X로 닫으며, 목록 상태는
 * 그대로 유지된다(아무것도 초기화/커밋되지 않음). '+ 추가' 탭 시 팝업을 먼저 닫은 뒤
 * 상위에서 전달받은 onAddClick을 호출해 딤 배경이 중첩되지 않도록 한다.
 * MissionCardBig의 이미지·해시태그·난이도 표현 방식을 그대로 재사용한다.
 */
"use client";

import { useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useFocusTrap } from "@/app/_components/hooks/useFocusTrap";
import { CameraIcon } from "@/app/_components/icons";
import AddToggleButton from "./AddToggleButton";
import DifficultyStars from "./DifficultyStars";
import type { Mission } from "@/app/_api/missions";

interface MissionDetailPopupProps {
  mission: Mission | null;
  onClose: () => void;
  onAddClick: (mission: Mission) => void;
}

export default function MissionDetailPopup({
  mission,
  onClose,
  onAddClick,
}: MissionDetailPopupProps) {
  const t = useTranslations("mission");
  const open = mission !== null;
  const panelRef = useFocusTrap(open);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  // 팝업을 먼저 닫아 딤 배경 중첩 없이 다음 오버레이(추가 시트/해제 다이얼로그)로 이어간다
  const handleAddClick = useCallback(() => {
    if (!mission) return;
    onClose();
    onAddClick(mission);
  }, [mission, onClose, onAddClick]);

  if (!mission) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-[16px]">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={mission.title}
        className="relative w-full max-w-[344px] rounded-[20px] bg-white p-[16px] shadow-[0px_6px_11px_0px_rgba(23,23,23,0.09)]"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="text-[20px] leading-none text-neutral-400"
          >
            ✕
          </button>
        </div>

        <div className="relative h-[185px] w-full overflow-hidden rounded-[12px] bg-surface">
          {mission.imageUrl ? (
            <img
              src={mission.imageUrl}
              alt={mission.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CameraIcon size={32} className="text-muted" />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[17px] font-semibold tracking-[-0.085px] text-ink">
              {mission.title}
            </h2>
            <AddToggleButton
              isAdded={mission.isAdded}
              onClick={handleAddClick}
            />
          </div>

          <p className="whitespace-pre-line text-[12px] font-medium leading-[1.6] text-subtext">
            {mission.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {mission.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-surface px-3 py-1 text-[12px] font-medium text-subtext"
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex justify-end">
            <DifficultyStars difficulty={mission.difficulty} />
          </div>
        </div>
      </div>
    </div>
  );
}
