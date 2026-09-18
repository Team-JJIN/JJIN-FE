/**
 * @component Avatar
 * 원형 프로필 이미지. src가 없으면 피그마 icon/profile(376:3010)을 그대로 옮긴 인라인 SVG
 * 플레이스홀더(연회색 원 + 머리·몸통 실루엣)를 40×40 viewBox 기준으로 그린다.
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M5 20C5 11.7157 11.7157 5 20 5C28.2843 5 35 11.7157 35 20C35 28.2843 28.2843 35 20 35C11.7157 35 5 28.2843 5 20Z"
        className="fill-surface"
      />
      <circle cx="19.6667" cy="16.6667" r="6.66667" className="fill-muted" />
      <path
        d="M20 25C24.5633 25 28.5143 27.246 30.4317 30.5183C30.4886 30.6154 30.4709 30.7385 30.3897 30.8165C27.694 33.4066 24.0335 35 20 35C15.9669 35 12.3068 33.407 9.61116 30.8175C9.52999 30.7395 9.51229 30.6164 9.56919 30.5193C11.4863 27.2467 15.4365 25.0001 20 25Z"
        className="fill-muted"
      />
    </svg>
  );
}
