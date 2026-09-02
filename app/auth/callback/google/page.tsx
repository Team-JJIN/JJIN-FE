import { Suspense } from "react";
import GoogleCallbackPage from "./GoogleCallbackPage";

export default function Page() {
  return (
    <Suspense>
      <GoogleCallbackPage />
    </Suspense>
  );
}
