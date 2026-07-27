"use client";

type CalendarMonthProps = {
  year: number;
  month: number;
  today: Date;
  tempDateStart: string | null;
  tempDateEnd: string | null;
  onDayClick: (d: string) => void;
  viewMonth: { year: number; month: number };
  setViewMonth: React.Dispatch<React.SetStateAction<{ year: number; month: number }>>;
  isFirstMonth: boolean;
};

export default function CalendarMonth({
  year,
  month,
  today,
  tempDateStart,
  tempDateEnd,
  onDayClick,
  viewMonth,
  setViewMonth,
  isFirstMonth,
}: CalendarMonthProps) {
  const m = month;
  const y = year;
  const days = new Date(y, m + 1, 0).getDate();
  const first = new Date(y, m, 1).getDay();
  const toStr = (day: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isDis = (day: number) => new Date(y, m, day) < today;
  const isSel = (day: number) => { const d = toStr(day); return d === tempDateStart || d === tempDateEnd; };
  const isIn = (day: number) => { if (!tempDateStart || !tempDateEnd) return false; const d = toStr(day); return d > tempDateStart && d < tempDateEnd; };

  return (
    <div className={!isFirstMonth ? "mt-6" : ""}>
      {/* 월 헤더 — "일"과 동일 왼쪽 위치 */}
      <div className="flex items-center gap-2 mb-3 ml-[4px]">
        {isFirstMonth && (
          <button type="button" onClick={() => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })} className="text-[20px] text-neutral-400 leading-none -mt-[1px]">‹</button>
        )}
        <span className="text-[15px] font-semibold text-dark">{y}년 {m + 1}월</span>
        {isFirstMonth && (
          <button type="button" onClick={() => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })} className="text-[20px] text-neutral-400 leading-none -mt-[1px]">›</button>
        )}
      </div>

      {/* 요일 */}
      <div className="grid grid-cols-7 mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div key={d} className="flex justify-center">
            <span className="h-[32px] w-[32px] flex items-center justify-center text-[12px] text-[#737373]">{d}</span>
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-y-[5px]">
        {Array.from({ length: first }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const disabled = isDis(day);
          const selected = isSel(day);
          const inRange = isIn(day);

          return (
            <div key={day} className="flex justify-center">
              <button
                type="button"
                disabled={disabled}
                onClick={() => onDayClick(toStr(day))}
                className={`h-[32px] w-[32px] rounded-full text-[14px] font-medium transition-colors ${
                  disabled ? "text-[#C4C4C4]" :
                  selected ? "bg-lime text-[#2A2A2A] font-bold" :
                  inRange ? "bg-[#F7F7F7] text-[#2A2A2A]" :
                  "text-[#737373]"
                }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
