/**
 * 홈 도메인 레이아웃. 하단 공통 네비게이션 바를 함께 렌더링한다.
 */
import BottomNav from "@/app/_components/ui/BottomNav";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
