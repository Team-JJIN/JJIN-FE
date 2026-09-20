/**
 * @component AddPlaceButton
 * 빈 코스 또는 코스 편집 중 리스트 맨 아래에 노출되는 장소 추가 버튼.
 */
"use client";

import { useTranslations } from "next-intl";
import { PlusIcon, ArrowForwardIcon } from "@/app/_components/icons";
import Spinner from "@/app/_components/ui/Spinner";

interface AddPlaceButtonProps {
  onClick: () => void;
  pending?: boolean;
}

export default function AddPlaceButton({
  onClick,
  pending = false,
}: AddPlaceButtonProps) {
  const t = useTranslations("plan");

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className="flex w-full items-center justify-between rounded-[14px] border border-dashed border-[#e1e2e4] bg-white px-4 py-[13px] transition motion-safe:active:scale-[0.98]"
    >
      <span className="flex items-center gap-3">
        <PlusIcon size={24} className="text-[#9b9b9b]" />
        <span className="text-[15px] font-semibold leading-[1.4] tracking-[-0.045px] text-subtext">
          {t("addPlace")}
        </span>
      </span>
      {pending ? (
        <Spinner className="text-[#9b9b9b]" />
      ) : (
        <ArrowForwardIcon size={24} className="text-[#9b9b9b]" />
      )}
    </button>
  );
}
