"use client";

import { useTranslations } from "next-intl";

export type PageSkeletonProps = {
  contentOnly?: boolean;
};

export function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`${className} animate-pulse bg-surface motion-reduce:animate-none`}
    />
  );
}

export function SkeletonStatus({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("navigation");

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t("loading")}
      className={className}
    >
      <div aria-hidden="true" className="contents">
        {children}
      </div>
    </div>
  );
}
