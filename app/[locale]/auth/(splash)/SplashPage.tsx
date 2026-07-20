"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Button from "@/app/_components/ui/Button";
import LanguageOption from "@/app/_components/ui/LanguageOption";

const LANGUAGES = [
  { locale: "en", label: "English" },
  { locale: "ja", label: "日本語" },
  { locale: "zh", label: "中文" },
  { locale: "ko", label: "한국어" },
];

const SPLASH_MESSAGES: Record<string, { languageSelect: string; start: string }> = {
  en: { languageSelect: "Language", start: "Start" },
  ja: { languageSelect: "言語選択", start: "スタート" },
  zh: { languageSelect: "选择语言", start: "开始" },
  ko: { languageSelect: "언어 선택", start: "시작" },
};

export default function SplashPage() {
  const router = useRouter();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);

  const messages = SPLASH_MESSAGES[selectedLocale] ?? SPLASH_MESSAGES.en;

  return (
    <div className="flex h-dvh flex-col bg-white px-5">
      {/* 상단 여백 — 전체 높이의 비율로 */}
      <div className="flex-[2]" />

      {/* 로고 */}
      <div className="flex h-[22vh] w-full items-center justify-center rounded-2xl bg-neutral-100">
        <span className="text-lg font-bold tracking-widest text-neutral-400">JJIN</span>
      </div>

      {/* 로고~언어 사이 빈 공간 */}
      <div className="flex-[3]" />

      {/* 언어 선택 */}
      <div>
        <p className="mb-3 text-xs text-neutral-500">{messages.languageSelect}</p>
        <div className="flex flex-col gap-2.5">
          {LANGUAGES.map(({ locale, label }) => (
            <LanguageOption
              key={locale}
              locale={locale}
              label={label}
              selected={selectedLocale === locale}
              onSelect={setSelectedLocale}
            />
          ))}
        </div>
      </div>

      {/* Start 버튼 */}
      <div className="pb-8 pt-4">
        <Button fullWidth onClick={() => router.push(`/${selectedLocale}/auth/login`)}>
          {messages.start}
        </Button>
      </div>
    </div>
  );
}
