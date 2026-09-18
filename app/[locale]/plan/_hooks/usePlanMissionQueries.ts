"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/app/_api/client";
import {
  addPlanMission,
  authenticatePlanMission,
  fetchPlanMissionAuthentication,
  fetchPlanMissionRecommendations,
  fetchPlanMissions,
  publishPlanMission,
  removePlanMission,
  uploadPlanMissionProof,
  type PlanMissionFilter,
} from "@/app/_api/plan-missions";
import { missionKeys } from "@/app/[locale]/mission/_hooks/useMissionQueries";
import { feedKeys } from "@/app/[locale]/mission/_hooks/useFeedQueries";
import { planMissionKeys } from "./planMissionKeys";

export { planMissionKeys } from "./planMissionKeys";

export function usePlanMissions(
  planId: string | null,
  filter: PlanMissionFilter = "ALL",
) {
  return useQuery({
    queryKey: planMissionKeys.list(planId ?? "", filter),
    queryFn: () => fetchPlanMissions(planId as string, filter),
    enabled: !!planId,
  });
}

export function usePlanMissionRecommendations(
  planId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: planMissionKeys.recommendations(planId ?? ""),
    queryFn: () => fetchPlanMissionRecommendations(planId as string),
    enabled: enabled && !!planId,
  });
}

export function usePlanMissionAuthentication(
  planId: string | null,
  userMissionId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: planMissionKeys.authentication(planId ?? "", userMissionId ?? ""),
    queryFn: () =>
      fetchPlanMissionAuthentication(planId as string, userMissionId as string),
    enabled: enabled && !!planId && !!userMissionId,
  });
}

function useInvalidatePlanMissions() {
  const client = useQueryClient();
  return {
    client,
    invalidate: (planId: string) =>
      Promise.all([
        client.invalidateQueries({
          queryKey: planMissionKeys.list(planId).slice(0, 3),
        }),
        client.invalidateQueries({
          queryKey: planMissionKeys.recommendations(planId),
        }),
        client.invalidateQueries({ queryKey: missionKeys.all }),
      ]),
  };
}

export function useAddPlanMission() {
  const { invalidate } = useInvalidatePlanMissions();
  return useMutation({
    mutationFn: ({
      planId,
      missionId,
    }: {
      planId: string;
      missionId: string;
    }) => addPlanMission(planId, missionId),
    onSettled: (_data, _error, variables) => invalidate(variables.planId),
    retry: false,
  });
}

export function useRemovePlanMission() {
  const { invalidate } = useInvalidatePlanMissions();
  return useMutation({
    mutationFn: ({
      planId,
      userMissionId,
    }: {
      planId: string;
      userMissionId: string;
    }) => removePlanMission(planId, userMissionId),
    onSettled: (_data, _error, variables) => invalidate(variables.planId),
    retry: false,
  });
}

export function useUploadPlanMissionProof() {
  return useMutation({
    mutationFn: ({ file, signal }: { file: File; signal?: AbortSignal }) =>
      uploadPlanMissionProof(file, signal),
    retry: false,
  });
}

export function useAuthenticatePlanMission() {
  const { client, invalidate } = useInvalidatePlanMissions();
  return useMutation({
    mutationFn: ({
      planId,
      userMissionId,
      proofImageUrl,
    }: {
      planId: string;
      userMissionId: string;
      proofImageUrl: string;
    }) => authenticatePlanMission(planId, userMissionId, proofImageUrl),
    onSettled: (_data, error, variables) => {
      if (error && (!(error instanceof ApiError) || error.status !== 409))
        return;
      return Promise.all([
        invalidate(variables.planId),
        client.invalidateQueries({
          queryKey: planMissionKeys.authentication(
            variables.planId,
            variables.userMissionId,
          ),
        }),
      ]);
    },
    retry: false,
  });
}

export function usePublishPlanMission() {
  const { client, invalidate } = useInvalidatePlanMissions();
  return useMutation({
    mutationFn: ({
      planId,
      userMissionId,
      content,
    }: {
      planId: string;
      userMissionId: string;
      content: string | null;
    }) => publishPlanMission(planId, userMissionId, content),
    onSettled: (_data, _error, variables) =>
      Promise.all([
        invalidate(variables.planId),
        client.invalidateQueries({
          queryKey: planMissionKeys.authentication(
            variables.planId,
            variables.userMissionId,
          ),
        }),
        client.invalidateQueries({ queryKey: feedKeys.all }),
      ]),
    retry: false,
  });
}
