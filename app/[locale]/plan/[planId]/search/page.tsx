import { Suspense } from "react";
import PlanSearchPage from "./PlanSearchPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PlanSearchPage />
    </Suspense>
  );
}
