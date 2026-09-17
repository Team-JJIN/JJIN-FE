/**
 * @component InputText
 * surface(#F7F7F7) 배경, 44px 높이, 14px 라운드.
 * 포커스 시 테두리 없음, 에러 시에만 빨간 테두리 + 에러 메시지(#FF7BA2).
 */
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  rightElement?: React.ReactNode;
}

const InputText = forwardRef<HTMLInputElement, InputProps>(
  ({ error, rightElement, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          <input
            ref={ref}
            className={cn(
              "h-[44px] w-full rounded-[14px] bg-surface px-3 text-[14px] font-medium leading-[160%] placeholder:text-muted transition-colors duration-150",
              "border-2 border-transparent focus:outline-none",
              // 에러일 때만 테두리 표시(#FF7BA2). 평상시/포커스 시에는 테두리 없음.
              error && "border-error",
              rightElement && "pr-12",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">{rightElement}</div>
          )}
        </div>
        {error && <p className="mt-1 text-[12px] font-medium text-error">{error}</p>}
      </div>
    );
  }
);

InputText.displayName = "InputText";

export default InputText;
