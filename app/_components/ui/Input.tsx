/**
 * @component Input
 * @prop error        에러 메시지 — 빨간 테두리 + 하단 텍스트 표시
 * @prop rightElement 오른쪽 삽입 요소 (표시/숨김 버튼, 인증 요청 버튼 등)
 */
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, rightElement, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          <input
            ref={ref}
            className={cn(
              "h-12 w-full rounded-xl border bg-white px-4 text-base placeholder:text-neutral-400 transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent",
              error ? "border-red-400 focus:ring-red-400" : "border-neutral-200",
              rightElement && "pr-24",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
