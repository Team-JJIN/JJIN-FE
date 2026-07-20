import { Suspense } from "react";
import EmailVerifyPage from "./EmailVerifyPage";

export default function Page() {
  return (
    <Suspense>
      <EmailVerifyPage />
    </Suspense>
  );
}
