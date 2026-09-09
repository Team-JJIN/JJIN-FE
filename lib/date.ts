/**
 * @module lib/date
 * LocalDate("YYYY-MM-DD") 파싱·가산·표시 순수 함수 모음. Intl 미사용(로컬 getFullYear/getMonth/getDate만 사용).
 */

// ISO(YYYY-MM-DD) 날짜 문자열을 로컬 타임존 기준으로 파싱한다.
// new Date(iso)는 UTC 자정으로 해석되어 음수 UTC 오프셋 지역에서 하루 밀리는 문제가 있어 직접 분해한다.
// 형식이 깨진 값은 null — Invalid Date를 Intl.DateTimeFormat에 넘기면 RangeError로 패널 전체가 죽는다.
export function parseIsoDate(iso: string): Date | null {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 원본을 변형하지 않고 days만큼 더한 새 Date를 반환한다. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** "2026.03.06" 형식. 로컬 타임존 기준(getFullYear/getMonth/getDate), 2자리 zero-pad. */
export function formatDotDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
