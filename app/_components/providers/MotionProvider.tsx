"use client";

import { MotionConfig } from "framer-motion";

/** prefers-reduced-motion 사용자 설정을 framer-motion 전체에 반영한다. */
export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
