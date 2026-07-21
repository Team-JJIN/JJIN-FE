import { Suspense } from "react";
import SignUpPage from "./SignUpPage";

export default function Page() {
  return (
    <Suspense>
      <SignUpPage />
    </Suspense>
  );
}
