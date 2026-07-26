/**
 * @component Input
 * surface(#F7F7F7) 배경, 44px 높이, 14px 라운드. 포커스 시 보더 활성.
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
              "h-[44px] w-full rounded-[14px] bg-surface px-3 text-[14px] font-medium leading-[160%] placeholder:text-muted transition-all duration-150",
              "border border-transparent focus:outline-none focus:border-dark",
              error && "border-red-400",
              rightElement && "pr-12",
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

InputText.displayName = "InputText";

export default InputText;
