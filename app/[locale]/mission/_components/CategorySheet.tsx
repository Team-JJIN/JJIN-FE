/**
 * @component CategorySheet
 * 카테고리 다중 선택 바텀시트. 열릴 때마다 커밋된 선택값을 임시 상태(temp)로 복사해 두고,
 * 확인 버튼을 눌러야만 상위로 커밋한다. X·딤 배경 탭·ESC로 닫으면 temp를 즉시 커밋값으로
 * 되돌린 뒤 onClose를 호출한다(재오픈 시 1프레임 stale 표시 및 카운트 쿼리 캐시 증식 방지).
 * 확인 버튼 라벨의 개수는 temp 카테고리 + 현재 검색어/난이도를 조합한 단발성 조회로 계산하며,
 * 이 쿼리키는 ["missions"] prefix 밖에 둬 미션 목록 낙관적 패치/무효화 대상에서 원천 제외한다.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import BigButton from "@/app/_components/ui/BigButton";
import SelectChip from "@/app/_components/ui/SelectChip";
import { searchMissions } from "@/app/_api/missions";
import { MISSION_CATEGORIES } from "../_constants";
import type { MissionCategory, MissionDifficulty } from "@/app/_api/missions";

interface CategorySheetProps {
  open: boolean;
  categories: MissionCategory[];
  query: string;
  difficulty: MissionDifficulty | null;
  onClose: () => void;
  onConfirm: (categories: MissionCategory[]) => void;
}

export default function CategorySheet({
  open,
  categories,
  query,
  difficulty,
  onClose,
  onConfirm,
}: CategorySheetProps) {
  const t = useTranslations("mission");

  // 시트가 열릴 때만 커밋된 선택값을 temp로 동기화한다 (닫기 시 discard, 확인 시에만 commit)
  const [tempCategories, setTempCategories] =
    useState<MissionCategory[]>(categories);
  useEffect(() => {
    if (open) {
      setTempCategories(categories);
    }
  }, [open, categories]);

  const { data } = useQuery({
    queryKey: ["missionSearchCount", tempCategories, query, difficulty],
    queryFn: () =>
      searchMissions({
        query,
        categories: tempCategories,
        difficulty,
        sort: "popular",
        cursor: 0,
      }),
    enabled: open,
    placeholderData: keepPreviousData,
  });
  const count = data?.totalCount ?? 0;

  const handleToggle = useCallback((category: MissionCategory) => {
    setTempCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(tempCategories);
  }, [tempCategories, onConfirm]);

  // 닫힘 경로(X·딤 배경 탭·ESC) 공통 처리: temp를 커밋값으로 즉시 되돌린다.
  const handleClose = useCallback(() => {
    setTempCategories(categories);
    onClose();
  }, [categories, onClose]);

  return (
    <BottomSheet
      open={open}
      title={t("categoryLabel")}
      onClose={handleClose}
      closeLabel={t("close")}
      animated
      heightClass="h-auto"
      footer={
        <BigButton variant="primary" fullWidth onClick={handleConfirm}>
          {t("viewCount", { count })}
        </BigButton>
      }
    >
      <div className="flex flex-wrap gap-x-2 gap-y-4 pt-2 pb-4">
        {MISSION_CATEGORIES.map((category) => (
          <SelectChip
            key={category}
            label={t(`categories.${category}`)}
            selected={tempCategories.includes(category)}
            onToggle={() => handleToggle(category)}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
