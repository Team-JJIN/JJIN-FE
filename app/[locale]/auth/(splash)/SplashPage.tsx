"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/app/_components/hooks/useLocale";
import Image from "next/image";
import BigButton from "@/app/_components/ui/BigButton";
import MediumButton from "@/app/_components/ui/MediumButton";
import PageTransition from "@/app/_components/PageTransition";

const LANGUAGES = [
  { locale: "ko", label: "한국어" },
  { locale: "en", label: "English" },
  { locale: "ja", label: "日本語" },
];

export default function SplashPage() {
  const router = useRouter();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);

  return (
    <PageTransition>
    <div className="flex h-dvh flex-col bg-white px-[20px]">
      {/* 로고 — 화면 중앙 */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <Image
          src="/image/JJIN.svg"
          alt="JJIN"
          width={130}
          height={76}
          priority
          className="object-contain"
          style={{ width: "auto", height: "auto" }}
        />
        <p className="mt-[10px] text-[13px] font-normal text-[#C4C4C4]">
          Living life for real
        </p>
      </div>

      {/* 하단 영역 */}
      <div className="flex flex-col">
        {/* 언어 선택 라벨 */}
        <p className="text-[13px] text-muted mb-[21px]">언어 선택</p>

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
            시작하기
          </BigButton>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}
