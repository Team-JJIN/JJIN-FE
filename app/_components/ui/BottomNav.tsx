/**
 * @component BottomNav
 * 하단 고정 네비게이션 바(공통). 홈 / 미션 추천 / 미션 피드 / 마이페이지 4개 탭.
 * 현재 경로에 해당하는 탭을 활성 처리한다(활성 아이콘 on 버전이 있으면 교체, 없으면 불투명도로 강조).
 * 마이페이지는 활성 아이콘이 없고, 클릭 시 로그아웃 확인 다이얼로그를 띄운다. 로그아웃 후 첫 페이지로 이동.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "@/app/_components/hooks/useLocale";
import { logout } from "@/app/_api/auth";
import { getApiErrorMessage } from "@/app/_api/client";
import Dialog from "./Dialog";

type Tab = {
  key: "home" | "recommend" | "feed" | "mypage";
  iconOff: string;
  iconOn: string | null; // 활성 아이콘. null이면 off 아이콘을 그대로 사용
  width: number; // 아이콘 너비(px). 높이는 비율 유지를 위해 auto
  path: string | null; // null이면 라우팅 대신 로그아웃 액션(마이페이지)
};

const TABS: Tab[] = [
  { key: "home", iconOff: "/image/nav-home-off.png", iconOn: "/image/nav-home-on.png", width: 20, path: "/home" },
  { key: "recommend", iconOff: "/image/nav-search-off.png", iconOn: "/image/nav-search-on.png", width: 20, path: "/mission" },
  { key: "feed", iconOff: "/image/nav-feed-off.png", iconOn: "/image/nav-feed-on.png", width: 20, path: "/mission/feed" },
  { key: "mypage", iconOff: "/image/nav-mypage-off.png", iconOn: null, width: 20, path: null },
];

const NAV_HEIGHT = 80;
const ICON_BOX = 24; // 아이콘 세로 영역

export default function BottomNav() {
  const t = useTranslations("nav");
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);

  // locale prefix를 제거한 경로 (예: /ko/mission/feed -> /mission/feed)
  const relativePath = pathname?.replace(new RegExp(`^/${locale}`), "") || "/";

  const isActive = (path: string | null) => {
    if (!path) return false;
    // 미션 추천(/mission)은 정확히 일치할 때만 활성 (하위 경로 /mission/feed 등은 각자 탭이 처리)
    return path === "/mission" ? relativePath === "/mission" : relativePath.startsWith(path);
  };

  const handleTab = (tab: Tab) => {
    if (tab.path === null) {
      setLogoutOpen(true);
      return;
    }
    router.push(`/${locale}${tab.path}`);
  };

  const handleLogout = async () => {
    setLogoutOpen(false);
    try {
      await logout();
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[nav] 로그아웃 실패:", getApiErrorMessage(err, "logout failed"));
      }
    } finally {
      // 로그아웃 후 첫 페이지(스플래시/언어 선택)로 이동
      router.push(`/${locale}`);
    }
  };

  return (
    <>
      <nav
        className="absolute bottom-0 left-0 right-0 z-40 flex items-center border-t border-line bg-white"
        style={{ height: NAV_HEIGHT }}
      >
        {TABS.map((tab) => {
          const active = isActive(tab.path);
          // 활성 탭만 on 아이콘, 나머지는 off. (mypage처럼 on이 없으면 항상 off)
          const src = active && tab.iconOn ? tab.iconOn : tab.iconOff;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTab(tab)}
              aria-label={t(tab.key)}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center gap-[6px]"
            >
              <span className="flex items-center justify-center" style={{ height: ICON_BOX }}>
                <Image
                  src={src}
                  alt=""
                  width={tab.width}
                  height={ICON_BOX}
                  sizes={`${tab.width}px`}
                  className="h-auto object-contain"
                  style={{ width: tab.width }}
                />
              </span>
              <span className={`text-[10px] font-normal ${active ? "text-ink" : "text-muted"}`}>
                {t(tab.key)}
              </span>
            </button>
          );
        })}
      </nav>

      <Dialog
        open={logoutOpen}
        title={t("logoutTitle")}
        description={t("logoutDescription")}
        cancelLabel={t("cancel")}
        confirmLabel={t("confirm")}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}
