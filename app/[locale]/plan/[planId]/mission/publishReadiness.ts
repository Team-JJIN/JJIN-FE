import type { PlanMissionAuthentication } from "@/app/_api/plan-missions";

type AuthenticationRefresh = {
  isSuccess: boolean;
  data?: Pick<PlanMissionAuthentication, "status" | "proofImageUrl">;
};

/** Cached data never authorizes another POST after a failed refresh. */
export function canPublishAfterRefresh(result: AuthenticationRefresh): boolean {
  return (
    result.isSuccess &&
    result.data?.status === "UPLOAD_PENDING" &&
    !!result.data.proofImageUrl
  );
}

export function isCompletedAfterRefresh(
  result: AuthenticationRefresh,
): boolean {
  return result.isSuccess && result.data?.status === "COMPLETED";
}
