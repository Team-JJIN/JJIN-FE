import { MOBILE_FRAME_CLASS } from "@/lib/utils";
import "@/app/globals.css";

export default function GoogleCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="bg-neutral-100">
        <div className={MOBILE_FRAME_CLASS}>{children}</div>
      </body>
    </html>
  );
}
