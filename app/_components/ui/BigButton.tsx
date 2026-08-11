/**
 * @component Button
 * primary: 검정 배경 + lime 텍스트 | lime: lime 배경 + 검정 텍스트 | outline: 테두리
 */
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "lime" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-dark text-lime disabled:bg-[#DCDCDC] disabled:text-[#737373]",
  lime: "bg-lime text-dark disabled:bg-dark disabled:text-lime",
  outline: "bg-white text-dark border border-neutral-200",
};

const BigButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      fullWidth = false,
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "h-[48px] rounded-[16px] font-semibold text-[15px] leading-[140%] tracking-[-0.3%] transition duration-150 motion-safe:active:enabled:scale-[0.98]",
          variantStyles[variant],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

BigButton.displayName = "BigButton";

export default BigButton;
