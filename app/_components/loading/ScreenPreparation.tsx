"use client";

import { useTranslations } from "next-intl";
import Spinner from "@/app/_components/ui/Spinner";

export default function ScreenPreparation({
  className = "",
}: {
  className?: string;
}) {
  const t = useTranslations("navigation");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t("loading")}
      className={`flex min-h-full w-full items-center justify-center bg-white ${className}`}
    >
      <Spinner className="size-8 text-dark" />
    </div>
  );
}
