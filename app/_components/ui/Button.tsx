/**
 * @component Button
 * @prop variant   "primary"(기본 검정) | "outline"(테두리) | "ghost"(배경 없음)
 * @prop size      "sm" | "md" | "lg" (default: "lg")
 * @prop fullWidth 부모 너비에 꽉 참
 * @prop isLoading 스피너 표시 + 비활성화
 */
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 disabled:bg-neutral-400",
  outline:
    "bg-white text-black border border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50",
  ghost:
    "bg-transparent text-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-base font-bold",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "lg",
      fullWidth = false,
      isLoading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "rounded-xl transition-colors duration-150 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className
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
  }
);

Button.displayName = "Button";

export default Button;
