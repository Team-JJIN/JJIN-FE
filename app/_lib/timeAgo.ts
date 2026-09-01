/**
 * @module lib/timeAgo
 * ISO 시각 → 현재 기준 상대 시간 문자열 ("3분 전", "2 hours ago"). Intl.RelativeTimeFormat 사용.
 * 1분 미만은 null을 돌려주고 호출부가 i18n "방금 전"을 쓴다 (RelativeTimeFormat의 "0분 전"이 어색하기 때문).
 * 서버 timeAgo 문자열은 쓰지 않는다 — 언어별 표기가 필요하고 표시 시점마다 새로 계산해야 하므로 (docs/API-RULE.md).
 */

const MINUTE = 60 * 1000;

const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: "year", ms: 365 * 24 * 60 * MINUTE },
  { unit: "month", ms: 30 * 24 * 60 * MINUTE },
  { unit: "week", ms: 7 * 24 * 60 * MINUTE },
  { unit: "day", ms: 24 * 60 * MINUTE },
  { unit: "hour", ms: 60 * MINUTE },
  { unit: "minute", ms: MINUTE },
];

export function formatTimeAgo(
  iso: string,
  locale: string,
  now: number = Date.now(),
): string | null {
  const elapsed = now - new Date(iso).getTime();
  if (!Number.isFinite(elapsed) || elapsed < MINUTE) return null;

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "always" });
  for (const { unit, ms } of UNITS) {
    if (elapsed >= ms) return rtf.format(-Math.floor(elapsed / ms), unit);
  }
  return null;
}
