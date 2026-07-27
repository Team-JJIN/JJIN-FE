"use client";

import BottomSheet from "@/app/_components/ui/BottomSheet";
import BigButton from "@/app/_components/ui/BigButton";
import ResetButton from "@/app/_components/ui/ResetButton";
import SelectChip from "@/app/_components/ui/SelectChip";
import { REGIONS } from "../_constants";

type RegionSheetProps = {
  open: boolean;
  tempRegion: string;
  setTempRegion: (r: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RegionSheet({
  open,
  tempRegion,
  setTempRegion,
  onClose,
  onConfirm,
}: RegionSheetProps) {
  return (
    <BottomSheet
      open={open}
      title="방문 지역 선택"
      onClose={onClose}
      aboveFooter={
        <span className="rounded-full bg-[#F4FFD6] px-4 py-[10px] text-[12px] font-medium text-dark">
          최대 1개까지 선택할 수 있어요
        </span>
      }
      footer={
        <div className="flex items-center justify-between">
          <ResetButton onClick={() => setTempRegion("")} />
          <BigButton
            disabled={!tempRegion}
            onClick={onConfirm}
            className="w-[164px] rounded-[16px]"
          >
            선택 완료
          </BigButton>
        </div>
      }
    >
      {/* 검색 — 37px 아래 */}
      <div className="mt-[5px] flex items-center h-[44px] rounded-[14px] bg-surface px-3">
        <input placeholder="어디로 방문하시나요?" className="flex-1 bg-transparent text-[14px] font-medium outline-none placeholder:text-[#C4C4C4]" readOnly />
        <img src="/image/search-icon.svg" alt="검색" width={20} height={20} />
      </div>

      {/* 인기 여행지 */}
      <p className="mt-6 text-[13px] font-medium text-dark mb-3">인기 여행지</p>
      <div className="grid grid-cols-6 gap-2">
        {REGIONS.map((r) => (
          <SelectChip
            key={r}
            label={r}
            selected={tempRegion === r}
            onToggle={() => setTempRegion(r === tempRegion ? "" : r)}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
