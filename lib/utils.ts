import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 앱 전역 모바일 프레임(최대 430px, 중앙 정렬) 컨테이너 클래스. */
export const MOBILE_FRAME_CLASS =
  "mx-auto w-full max-w-[430px] min-h-dvh max-h-dvh bg-white relative shadow-xl overflow-x-hidden overflow-y-auto scrollbar-hide";
