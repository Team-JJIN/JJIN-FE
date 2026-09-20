import MissionCreateSheet from "./MissionCreateSheet";

export default function MissionCreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MissionCreateSheet>{children}</MissionCreateSheet>;
}
