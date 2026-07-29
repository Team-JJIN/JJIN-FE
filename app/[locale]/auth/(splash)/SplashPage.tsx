"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Image from "next/image";
import BigButton from "@/app/_components/ui/BigButton";
import MediumButton from "@/app/_components/ui/MediumButton";

const LANGUAGES = [
  { locale: "ko", label: "한국어" },
  { locale: "en", label: "English" },
  { locale: "ja", label: "日本語" },
];

// 선택 즉시 반영을 위한 스플래시 텍스트
const SPLASH_TEXT: Record<string, { languageSelect: string; start: string }> = {
  ko: { languageSelect: "언어 선택", start: "시작하기" },
  en: { languageSelect: "Language", start: "Get Started" },
  ja: { languageSelect: "言語選択", start: "スタート" },
};

export default function SplashPage() {
  const router = useRouter();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);

  const text = SPLASH_TEXT[selectedLocale] ?? SPLASH_TEXT.en;

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
        <p className="mt-[10px] text-[13px] font-normal text-[#C4C4C4]">
          Living life for real
        </p>
      </div>

      {/* 하단 영역 */}
      <div className="flex flex-col">
        {/* 언어 선택 라벨 */}
        <p className="text-[15px] font-semibold text-muted mb-[21px]">{text.languageSelect}</p>

        {/* 언어 버튼들 — 각 13px 간격 */}
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

        {/* 시작하기 버튼 — 언어 마지막에서 21px, 하단에서 43px */}
        <div className="mt-[21px] mb-[43px]">
          <BigButton fullWidth onClick={() => router.push(`/${selectedLocale}/auth/login`)}>
            {text.start}
          </BigButton>
        </div>
      </div>
    </div>
  );
}
