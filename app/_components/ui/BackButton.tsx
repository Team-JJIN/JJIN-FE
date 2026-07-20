/**
 * @component BackButton
 * @prop onClick 커스텀 핸들러 — 미전달 시 router.back()
 */
"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

export default function BackButton({ className, onClick }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={onClick ?? (() => router.back())}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-100 active:bg-neutral-200 transition-colors",
        className
      )}
      aria-label="Go back"
    >
      <ChevronLeft className="h-6 w-6 text-neutral-800" />
    </button>
  );
}
