/**
 * @component RangeSlider
 * @prop min/max 범위
 * @prop startVal/endVal 현재 값
 * @prop onChange (start, end) 콜백
 * @prop formatLabel 값 → 표시 문자열
 */
"use client";

interface RangeSliderProps {
  min: number;
  max: number;
  startVal: number;
  endVal: number;
  onChange: (start: number, end: number) => void;
  formatLabel?: (val: number) => string;
}

export default function RangeSlider({
  min,
  max,
  startVal,
  endVal,
  onChange,
  formatLabel = (v) => String(v),
}: RangeSliderProps) {
  const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {/* 라벨 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-800 w-12">{formatLabel(startVal)}</span>
        {/* 트랙 영역 */}
        <div className="relative flex-1 h-8 flex items-center">
          {/* 배경 트랙 */}
          <div className="absolute inset-x-0 h-1 rounded-full bg-neutral-200" />
          {/* 활성 구간 */}
          <div
            className="absolute h-1 rounded-full bg-neutral-800"
            style={{
              left: `${getPercent(startVal)}%`,
              width: `${getPercent(endVal) - getPercent(startVal)}%`,
            }}
          />
          {/* 좌 핸들 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-neutral-900 border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${getPercent(startVal)}% - 8px)` }}
          />
          {/* 우 핸들 */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-neutral-900 border-2 border-white shadow pointer-events-none"
            style={{ left: `calc(${getPercent(endVal)}% - 8px)` }}
          />
          {/* 좌 input */}
          <input
            type="range"
            min={min}
            max={max}
            value={startVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val < endVal) onChange(val, endVal);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: startVal > max - 10 ? 5 : 3 }}
          />
          {/* 우 input */}
          <input
            type="range"
            min={min}
            max={max}
            value={endVal}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > startVal) onChange(startVal, val);
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ zIndex: 4 }}
          />
        </div>
        <span className="text-sm font-medium text-neutral-800 w-12 text-right">{formatLabel(endVal)}</span>
      </div>
    </div>
  );
}
