"use client";

import Link, { useLinkStatus } from "next/link";
import { useTranslations } from "next-intl";
import { forwardRef, type ComponentProps } from "react";
import Spinner from "@/app/_components/ui/Spinner";
import { cn } from "@/lib/utils";

type NavigationLinkProps = Omit<ComponentProps<typeof Link>, "ref">;

function PendingStatus() {
  const { pending } = useLinkStatus();
  const t = useTranslations("navigation");

  return (
    <span
      data-navigation-pending={pending ? "true" : undefined}
      role={pending ? "status" : undefined}
      className="contents"
    >
      {pending && (
        <>
          <Spinner className="absolute right-2 top-2 size-3" />
          <span className="sr-only">{t("pending")}</span>
        </>
      )}
    </span>
  );
}

const NavigationLink = forwardRef<HTMLAnchorElement, NavigationLinkProps>(
  ({ children, className, ...props }, ref) => (
    <Link
      ref={ref}
      className={cn(
        "relative transition-opacity has-[[data-navigation-pending=true]]:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
      <PendingStatus />
    </Link>
  ),
);

NavigationLink.displayName = "NavigationLink";

export default NavigationLink;
