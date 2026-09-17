/**
 * @component CourseLoading
 * B-2 코스 생성 로딩 화면. 전체 화면 로딩(탭 불가).
 * 진행 중: JJ 로고가 톱니바퀴처럼 "돌고 제자리" 반복 회전하고, 안내 문구가 6초 간격으로 순환한다.
 *   "...(마침표)"로 끝나는 문구는 끝점을 떼고 .→..→... 애니메이션 점으로 대체한다.
 * done(완료): 로고 회전을 멈추고 "코스 생성 완료" 문구 + 하단 완료 토스트를 노출한다.
 * 생성 실패 화면은 CourseError가 담당한다.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import CourseToast from "./CourseToast";

const MESSAGE_KEYS = ["loadingTitle", "loading1", "loading2", "loading3", "loading4"] as const;
// 각 문구는 6초씩 유지한다(AI 코스 생성이 40~50초 걸려 문구가 여러 번 순환).
const MESSAGE_INTERVAL_MS = 6000;
// 말줄임표 점 애니메이션 주기(.→..→...→. 반복).
const DOTS_INTERVAL_MS = 450;

interface CourseLoadingProps {
  /** 생성 완료 상태. 로고 회전을 멈추고 완료 문구·토스트를 노출한다. */
  done?: boolean;
}

export default function CourseLoading({ done = false }: CourseLoadingProps) {
  const t = useTranslations("plan.aiCourse");
  const [messageIndex, setMessageIndex] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGE_KEYS.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [done]);

  // 점(.)으로 끝나는 문구용 애니메이션 점 개수: 1→2→3→1 반복.
  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setDotCount((c) => (c % 3) + 1);
    }, DOTS_INTERVAL_MS);
    return () => clearInterval(id);
  }, [done]);

  const rawMessage = t(MESSAGE_KEYS[messageIndex]);
  // "코스 짜는 중..."처럼 끝의 마침표들을 떼고, 애니메이션 점으로 대체한다.
  const { base, hasDots } = useMemo(() => {
    const trimmed = rawMessage.replace(/\.+$/, "");
    return { base: trimmed, hasDots: trimmed !== rawMessage };
  }, [rawMessage]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white px-[20px]">
      {/* JJ 로고 — 진행 중엔 돌고 제자리 반복 회전, 완료되면 정지 */}
      <motion.div
        animate={done ? { rotate: 0 } : { rotate: [0, 360, 360] }}
        transition={
          done
            ? { duration: 0.4, ease: "easeOut" }
            : { duration: 1.6, times: [0, 0.6, 1], ease: "easeInOut", repeat: Infinity }
        }
      >
        <Image
          src="/image/JJ.png"
          alt=""
          width={111}
          height={111}
          priority
          className="h-[111px] w-[111px] object-contain"
        />
      </motion.div>

      {done ? (
        <p className="mt-[24px] text-[22px] font-semibold text-ink">{t("doneTitle")}</p>
      ) : (
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-[24px] text-[22px] font-semibold text-ink"
        >
          {base}
          {hasDots && (
            // 점이 늘었다 줄어도 문구 위치가 흔들리지 않도록 폭을 항상 확보한다.
            <span className="inline-block w-[1.2em] text-left align-baseline">
              {".".repeat(dotCount)}
            </span>
          )}
        </motion.p>
      )}

      {done && <CourseToast message={t("doneMessage")} hint={t("doneHint")} />}
    </div>
  );
}
