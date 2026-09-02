/**
 * @component TextArea
 * surface(#F7F7F7) 배경, 14px 라운드. 포커스 시 보더 활성. InputText.tsx와 동일 스타일 체계.
 */
import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full resize-none rounded-[14px] bg-surface px-3 py-3 text-[14px] font-medium leading-[160%] placeholder:text-muted transition-colors duration-150",
            "border-2 border-transparent focus:outline-none focus:border-dark",
            error && "border-red-400",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

export default TextArea;
