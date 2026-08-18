/**
 * @hook useFocusTrap
 * 모달류(바텀시트/다이얼로그)가 active 상태인 동안 포커스를 패널 내부로 가둔다.
 * active 진입 시 이전 포커스 요소를 기억해두고 패널로 초기 포커스를 이동하며,
 * Tab/Shift+Tab이 패널 내부 focusable 요소만 순환하도록 트랩한다.
 * active 해제 시 이전 포커스를 복원한다.
 */
"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active: boolean) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    // preventScroll 필수: 슬라이드업 모션 중(패널이 아직 화면 아래 y:100%)에 포커스가 이동하면
    // 브라우저가 패널을 보이게 하려고 조상 스크롤러를 강제 스크롤해
    // 배경 페이지가 튀고 등장 모션이 깨져 보인다.
    panelRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeElement = document.activeElement;

      if (e.shiftKey) {
        // 경계 조건: 초기 포커스는 패널 컨테이너 자신에 있다.
        // panel.contains(panel)이 true라 아래 조건만으로는 걸리지 않아
        // Shift+Tab 한 번에 트랩이 뒤로 뚫린다 — 패널 자신도 명시적으로 잡는다.
        if (
          activeElement === first ||
          activeElement === panel ||
          !panel.contains(activeElement)
        ) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (activeElement === last || !panel.contains(activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [active]);

  return panelRef;
}
