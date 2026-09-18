/**
 * @component Spinner
 * 버튼 안 요청 대기 표시. 색은 부모 글자색(currentColor)을 따르고, 트랙은 35% 투명도.
 * 부모 버튼에 aria-busy를 함께 건다.
 */
import { cn } from "@/lib/utils";

export default function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-[color:color-mix(in_srgb,currentColor_35%,transparent)] border-t-current motion-reduce:animate-none",
        className,
      )}
    />
  );
}
