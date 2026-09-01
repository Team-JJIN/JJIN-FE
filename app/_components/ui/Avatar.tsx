/**
 * @component Avatar
 * 원형 프로필 이미지. src가 없으면 bg-surface 원 + 회색 실루엣(머리+어깨) 플레이스홀더 (디자인 icon/profile).
 * 실루엣은 40px 기준 디자인(머리 지름 16, 어깨 지름 30, 어깨 하단 -8)을 %로 환산해 size에 따라 함께 스케일된다.
 * 닉네임 텍스트가 옆에 있는 자리에서는 alt=""로 장식 처리한다.
 */

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: number;
  className?: string;
}

export default function Avatar({
  src,
  alt,
  size = 40,
  className = "",
}: AvatarProps) {
  const style = { width: size, height: size };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      style={style}
      className={`relative shrink-0 overflow-hidden rounded-full bg-surface ${className}`}
    >
      <div className="absolute left-1/2 top-[30%] size-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted" />
      <div className="absolute -bottom-[20%] left-1/2 size-[75%] -translate-x-1/2 rounded-full bg-muted" />
    </div>
  );
}
