/**
 * @component CourseToast
 * 화면 하단 중앙에 뜨는 Pale Lime 알약 토스트 + 보조 안내 문구.
 * AI 코스 완료 안내와 실패 안내가 동일한 디자인을 공유한다.
 */
"use client";

import { motion } from "framer-motion";

interface CourseToastProps {
  message: string;
  hint: string;
}

export default function CourseToast({ message, hint }: CourseToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-[70px] left-0 right-0 flex flex-col items-center gap-[6px] px-[20px]"
    >
      <span className="rounded-full bg-lime-pale px-4 py-[10px] text-center text-[12px] font-medium text-ink">
        {message}
      </span>
      <span className="text-center text-[12px] font-medium text-subtext">{hint}</span>
    </motion.div>
  );
}
