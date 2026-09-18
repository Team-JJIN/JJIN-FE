import { apiDelete, apiGet, apiPost, ApiError } from "./client";
import { addMissionToPlans } from "./missions";
import {
  normalizeServerDate,
  toDifficulty,
  type MissionDifficulty,
  type MissionDifficultyDto,
} from "./shared";

export type PlanMissionStatus =
  "PROOF_REQUIRED" | "UPLOAD_PENDING" | "COMPLETED";
export type PlanMissionFilter = "ALL" | PlanMissionStatus;

export interface PlanMissionDto {
  userMissionId: number;
  missionId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  tags: string[];
  difficulty: MissionDifficultyDto;
  status: PlanMissionStatus;
  missionProofId: number | null;
}

export interface PlanMissionListDto {
  travelPlanId: number;
  travelPlanName: string;
  totalCount: number;
  proofRequiredCount: number;
  uploadPendingCount: number;
  completedCount: number;
  missions: PlanMissionDto[];
}

interface RecommendationMissionDto extends Omit<
  PlanMissionDto,
  "userMissionId" | "status"
> {
  userMissionId: number | null;
  status: PlanMissionStatus | null;
}

export interface PlanMissionRecommendationsDto extends Omit<
  PlanMissionListDto,
  | "missions"
  | "totalCount"
  | "proofRequiredCount"
  | "uploadPendingCount"
  | "completedCount"
> {
  missions: RecommendationMissionDto[] | null;
  totalCount: number | null;
  proofRequiredCount: number | null;
  uploadPendingCount: number | null;
  completedCount: number | null;
}

export interface PlanMissionAuthenticationDto {
  travelPlanId: number;
  userMissionId: number;
  missionId: number;
  missionTitle: string;
  status: PlanMissionStatus;
  proofImageUrl: string | null;
  authenticatedAt: string | null;
}

interface PostedPlanMissionFeedDto {
  missionProofId: number;
  userMissionId: number;
  missionId: number;
  status: "COMPLETED";
  imageUrl: string;
  content: string | null;
}

interface ProofPresignedUrlDto {
  presignedUrl: string;
  fileName: string;
}

export interface PlanMission {
  userMissionId: string;
  missionId: string;
  title: string;
  description: string;
  imageUrl: string | null;
  tags: string[];
  difficulty: MissionDifficulty;
  status: PlanMissionStatus;
  missionProofId: string | null;
}

export interface PlanMissionList {
  planId: string;
  planName: string;
  totalCount: number;
  proofRequiredCount: number;
  uploadPendingCount: number;
  completedCount: number;
  missions: PlanMission[];
}

export interface PlanMissionRecommendation extends Omit<
  PlanMission,
  "userMissionId" | "status"
> {
  userMissionId: string | null;
  status: PlanMissionStatus | null;
}

export interface PlanMissionRecommendations extends Omit<
  PlanMissionList,
  "missions"
> {
  missions: PlanMissionRecommendation[];
}

export interface PlanMissionAuthentication {
  planId: string;
  userMissionId: string;
  missionId: string;
  missionTitle: string;
  status: PlanMissionStatus;
  proofImageUrl: string | null;
  authenticatedAt: string | null;
}

export interface PostedPlanMissionFeed {
  missionProofId: string;
  userMissionId: string;
  missionId: string;
  status: "COMPLETED";
  imageUrl: string;
  content: string | null;
}

export function toPlanMission(dto: PlanMissionDto): PlanMission {
  return {
    userMissionId: String(dto.userMissionId),
    missionId: String(dto.missionId),
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    tags: [...dto.tags],
    difficulty: toDifficulty(dto.difficulty),
    status: dto.status,
    missionProofId:
      dto.missionProofId === null ? null : String(dto.missionProofId),
  };
}

export function toPlanMissionList(dto: PlanMissionListDto): PlanMissionList {
  return {
    planId: String(dto.travelPlanId),
    planName: dto.travelPlanName,
    totalCount: dto.totalCount,
    proofRequiredCount: dto.proofRequiredCount,
    uploadPendingCount: dto.uploadPendingCount,
    completedCount: dto.completedCount,
    missions: dto.missions.map(toPlanMission),
  };
}

/** The no-course response is a successful nullable collection; HTTP errors still reject. */
export function toPlanMissionRecommendations(
  dto: PlanMissionRecommendationsDto | null,
): PlanMissionRecommendations | null {
  if (dto === null || dto.missions === null) return null;
  if (
    dto.totalCount === null ||
    dto.proofRequiredCount === null ||
    dto.uploadPendingCount === null ||
    dto.completedCount === null
  ) {
    throw new ApiError(0, "추천 미션 응답 형식이 올바르지 않습니다.");
  }
  return {
    planId: String(dto.travelPlanId),
    planName: dto.travelPlanName,
    totalCount: dto.totalCount,
    proofRequiredCount: dto.proofRequiredCount,
    uploadPendingCount: dto.uploadPendingCount,
    completedCount: dto.completedCount,
    missions: dto.missions.map((mission) => ({
      userMissionId:
        mission.userMissionId === null ? null : String(mission.userMissionId),
      missionId: String(mission.missionId),
      title: mission.title,
      description: mission.description,
      imageUrl: mission.imageUrl,
      tags: [...mission.tags],
      difficulty: toDifficulty(mission.difficulty),
      status: mission.status,
      missionProofId:
        mission.missionProofId === null ? null : String(mission.missionProofId),
    })),
  };
}

export function toPlanMissionAuthentication(
  dto: PlanMissionAuthenticationDto,
): PlanMissionAuthentication {
  return {
    planId: String(dto.travelPlanId),
    userMissionId: String(dto.userMissionId),
    missionId: String(dto.missionId),
    missionTitle: dto.missionTitle,
    status: dto.status,
    proofImageUrl: dto.proofImageUrl,
    authenticatedAt:
      dto.authenticatedAt === null
        ? null
        : normalizeServerDate(dto.authenticatedAt),
  };
}

export function toPostedPlanMissionFeed(
  dto: PostedPlanMissionFeedDto,
): PostedPlanMissionFeed {
  return {
    missionProofId: String(dto.missionProofId),
    userMissionId: String(dto.userMissionId),
    missionId: String(dto.missionId),
    status: dto.status,
    imageUrl: dto.imageUrl,
    content: dto.content,
  };
}

export function planMissionProgress(
  list: Pick<
    PlanMissionList,
    "totalCount" | "uploadPendingCount" | "completedCount"
  >,
): number {
  return list.totalCount === 0
    ? 0
    : (list.uploadPendingCount + list.completedCount) / list.totalCount;
}

/** Preserve the encoded object path while removing the presigned query. */
export function toProofRawUrl(presignedUrl: string): string {
  const url = new URL(presignedUrl);
  if (url.protocol !== "https:")
    throw new ApiError(0, "인증 사진 URL 형식이 올바르지 않습니다.");
  return url.origin + url.pathname;
}

function missionPath(planId: string, userMissionId?: string): string {
  const base = `/api/travel-plans/${Number(planId)}/missions`;
  return userMissionId === undefined
    ? base
    : `${base}/${Number(userMissionId)}`;
}

export async function fetchPlanMissions(
  planId: string,
  filter: PlanMissionFilter = "ALL",
): Promise<PlanMissionList> {
  const { data } = await apiGet<PlanMissionListDto>(
    missionPath(planId),
    filter === "ALL" ? undefined : { status: filter },
  );
  return toPlanMissionList(data);
}

export async function fetchPlanMissionRecommendations(
  planId: string,
): Promise<PlanMissionRecommendations | null> {
  const { data } = await apiGet<PlanMissionRecommendationsDto | null>(
    `${missionPath(planId)}/recommendations`,
  );
  return toPlanMissionRecommendations(data);
}

export async function addPlanMission(
  planId: string,
  missionId: string,
): Promise<void> {
  await addMissionToPlans(missionId, [planId]);
}

export async function removePlanMission(
  planId: string,
  userMissionId: string,
): Promise<void> {
  await apiDelete(`${missionPath(planId, userMissionId)}`);
}

export async function uploadPlanMissionProof(
  file: File,
  signal?: AbortSignal,
): Promise<string> {
  if (signal?.aborted)
    throw new ApiError(499, "이미지 업로드가 취소되었습니다.");
  const { data } = await apiPost<ProofPresignedUrlDto>(
    "/api/missions/proofs/presigned-url",
    {
      fileName: file.name,
      contentType: file.type,
    },
  );
  if (signal?.aborted)
    throw new ApiError(499, "이미지 업로드가 취소되었습니다.");
  const rawUrl = toProofRawUrl(data.presignedUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort, { once: true });
  let response: Response;
  try {
    response = await fetch(data.presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
      signal: controller.signal,
    });
  } catch {
    if (signal?.aborted)
      throw new ApiError(499, "이미지 업로드가 취소되었습니다.");
    if (controller.signal.aborted)
      throw new ApiError(408, "이미지 업로드 시간이 초과되었습니다.");
    throw new ApiError(0, "이미지 업로드 서버에 연결할 수 없습니다.");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
  if (!response.ok)
    throw new ApiError(response.status, "이미지 업로드에 실패했습니다.");
  return rawUrl;
}

export async function authenticatePlanMission(
  planId: string,
  userMissionId: string,
  proofImageUrl: string,
): Promise<PlanMissionAuthentication> {
  const { data } = await apiPost<PlanMissionAuthenticationDto>(
    `${missionPath(planId, userMissionId)}/authenticate`,
    { proofImageUrl },
  );
  return toPlanMissionAuthentication(data);
}

export async function fetchPlanMissionAuthentication(
  planId: string,
  userMissionId: string,
): Promise<PlanMissionAuthentication> {
  const { data } = await apiGet<PlanMissionAuthenticationDto>(
    `${missionPath(planId, userMissionId)}/authentication`,
  );
  return toPlanMissionAuthentication(data);
}

export async function publishPlanMission(
  planId: string,
  userMissionId: string,
  content: string | null,
): Promise<PostedPlanMissionFeed> {
  const { data } = await apiPost<PostedPlanMissionFeedDto>(
    `${missionPath(planId, userMissionId)}/feed`,
    { content },
  );
  return toPostedPlanMissionFeed(data);
}
