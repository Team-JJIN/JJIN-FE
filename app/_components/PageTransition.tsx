/**
 * @component PageTransition
 * 페이지 전환 래퍼. 새 화면과 loading UI를 첫 프레임부터 숨김없이 표시한다.
 */
"use client";

import { motion } from "framer-motion";
import { DUR, EASE } from "@/app/_components/motion/tokens";

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: DUR.md, ease: EASE.page }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
