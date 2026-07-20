/**
 * @component Checkbox
 * @prop label 체크박스 옆 텍스트
 */
"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className="flex cursor-pointer items-start gap-2">
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-neutral-300 accent-black",
            className
          )}
          {...props}
        />
        <span className="text-sm text-neutral-600">{label}</span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
