import type { PlanMissionFilter } from "@/app/_api/plan-missions";

export const planMissionKeys = {
  all: ["planMissions"] as const,
  list: (planId: string, filter: PlanMissionFilter = "ALL") =>
    [...planMissionKeys.all, "list", planId, filter] as const,
  recommendationsAll: ["planMissionRecommendations"] as const,
  recommendations: (planId: string) =>
    [...planMissionKeys.recommendationsAll, planId] as const,
  authenticationAll: ["planMissionAuthentication"] as const,
  authentication: (planId: string, userMissionId: string) =>
    [...planMissionKeys.authenticationAll, planId, userMissionId] as const,
};
