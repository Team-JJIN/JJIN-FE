/**
 * @component BackButton
 * 뒤로가기 버튼. arrow_back-icon.png 사용. 24x24.
 */
"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  onClick?: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={onClick ?? (() => router.back())}
      className="flex h-10 w-10 items-center justify-center -ml-2"
      aria-label="Go back"
    >
      <img src="/image/arrow_back-icon.png" alt="뒤로" width={24} height={24} />
    </button>
  );
}
