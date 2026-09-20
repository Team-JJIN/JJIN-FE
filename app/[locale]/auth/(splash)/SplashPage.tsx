"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Image from "next/image";
import MediumButton from "@/app/_components/ui/MediumButton";
import { restoreSession } from "@/app/_api/client";
import NavigationLink from "@/app/_components/navigation/NavigationLink";

const LANGUAGES = [
  { locale: "ko", label: "한국어" },
  { locale: "en", label: "English" },
  { locale: "ja", label: "日本語" },
];

// 선택 즉시 반영을 위한 스플래시 텍스트 (i18n 대신 인라인 — 언어 선택 전 상태이므로)
const SPLASH_TEXT: Record<string, { languageSelect: string; start: string }> = {
  ko: { languageSelect: "언어 선택", start: "시작하기" },
  en: { languageSelect: "Language", start: "Get Started" },
  ja: { languageSelect: "言語選択", start: "スタート" },
};

export default function SplashPage() {
  const router = useRouter();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);
  // true: 토큰 유효성 확인 중 (로고만 표시), false: 스플래시 UI 완전 노출
  const [checking, setChecking] = useState(true);

  // 토큰이 살아있으면 스플래시를 건너뛰고 홈으로 바로 진입
  useEffect(() => {
    restoreSession().then((valid) => {
      if (valid) {
        router.replace(`/${currentLocale}/home`);
      } else {
        setChecking(false);
      }
    });
    // 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const text = SPLASH_TEXT[selectedLocale] ?? SPLASH_TEXT.en;

  // 토큰 확인 중: 로고만 중앙에 표시해 깜빡임 없이 자연스럽게 전환
  if (checking) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-white">
        <Image
          src="/image/JJ.png"
          alt="JJIN"
          width={120}
          height={120}
          priority
          className="w-[120px] h-[120px] object-contain"
        />
        <Image
          src="/image/JJIN.png"
          alt="JJIN"
          width={167}
          height={75}
          priority
          className="mt-[6px] w-[167px] h-[75.15px] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 로고 — 화면 중앙 */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <Image
          src="/image/JJ.png"
          alt="JJIN"
          width={120}
          height={120}
          priority
          className="w-[120px] h-[120px] object-contain"
        />
        <Image
          src="/image/JJIN.png"
          alt="JJIN"
          width={167}
          height={75}
          priority
          className="mt-[6px] w-[167px] h-[75.15px] object-contain"
        />
        <p className="mt-[10px] text-[13px] font-normal text-[#C4C4C4]">
          Living life for real
        </p>
      </div>

      {/* 하단 영역 */}
      <div className="flex flex-col">
        <p className="text-[15px] font-semibold text-muted mb-[21px]">
          {text.languageSelect}
        </p>

        <div className="flex flex-col gap-[13px]">
          {LANGUAGES.map(({ locale, label }) => (
            <MediumButton
              key={locale}
              locale={locale}
              label={label}
              selected={selectedLocale === locale}
              onSelect={setSelectedLocale}
            />
          ))}
        </div>

        {/* 시작하기 버튼 — 하단 여백은 화면이 작으면 24px, 700px↑이면 43px */}
        <div className="mt-[21px] mb-[24px] [@media(min-height:700px)]:mb-[43px]">
          <NavigationLink
            href={`/${selectedLocale}/auth/login`}
            className="flex h-[48px] w-full items-center justify-center rounded-[16px] bg-dark text-[15px] font-semibold leading-[140%] tracking-[-0.3%] text-lime transition duration-150 motion-safe:active:scale-[0.98]"
          >
            {text.start}
          </NavigationLink>
        </div>
      </div>
    </div>
  );
}
