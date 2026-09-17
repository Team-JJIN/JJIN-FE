/**
 * @component CourseLogo
 * AI 코스 화면(로딩/완료/실패)의 중앙 JJ 로고. 111x111 고정.
 */
"use client";

import Image from "next/image";

export default function CourseLogo() {
  return (
    <Image
      src="/image/JJ.png"
      alt=""
      width={111}
      height={111}
      priority
      className="h-[111px] w-[111px] object-contain"
    />
  );
}
