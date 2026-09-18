"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowForwardIcon,
  CameraIcon,
  CheckIcon,
  PlusIcon,
} from "@/app/_components/icons";
import { useLocale } from "@/app/_components/hooks/useLocale";
import BottomSheet from "@/app/_components/ui/BottomSheet";
import Spinner from "@/app/_components/ui/Spinner";
import { ApiError, getApiErrorMessage } from "@/app/_api/client";
import {
  planMissionProgress,
  type PlanMission,
  type PlanMissionFilter,
  type PlanMissionRecommendation,
} from "@/app/_api/plan-missions";
import { useMissionSheetStore } from "@/app/[locale]/mission/_store/useMissionSheetStore";
import DifficultyStars from "@/app/[locale]/mission/_components/DifficultyStars";
import {
  useAddPlanMission,
  useAuthenticatePlanMission,
  usePlanMissionAuthentication,
  usePlanMissionRecommendations,
  usePlanMissions,
  usePublishPlanMission,
  useUploadPlanMissionProof,
} from "@/app/[locale]/plan/_hooks/usePlanMissionQueries";
import PlanHeader from "../_components/PlanHeader";
import {
  fadeSwap,
  listItemEnter,
  layoutShift,
  sectionEnter,
  TAP,
  tabIndicator,
} from "@/app/_components/motion/tokens";
import {
  canPublishAfterRefresh,
  isCompletedAfterRefresh,
} from "./publishReadiness";

type ProofFlow = {
  mission: PlanMission;
  seq: number;
  file: File | null;
  stage: "proof" | "compose";
};
const FILTERS: PlanMissionFilter[] = [
  "ALL",
  "PROOF_REQUIRED",
  "UPLOAD_PENDING",
  "COMPLETED",
];

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`${className} animate-pulse bg-surface motion-reduce:animate-none`}
    />
  );
}

function RecommendationSkeleton() {
  return (
    <div className="flex gap-[19px] overflow-hidden px-4 pb-1">
      {["recommendation-a", "recommendation-b"].map((key) => (
        <div
          key={key}
          className="w-[220px] shrink-0 overflow-hidden rounded-[14px] bg-surface"
        >
          <SkeletonBlock className="h-[122px] w-full" />
          <div className="flex h-[136px] flex-col px-3 pb-3 pt-2">
            <SkeletonBlock className="h-4 w-3/4 rounded" />
            <SkeletonBlock className="mt-2 h-3 w-full rounded" />
            <SkeletonBlock className="mt-1 h-3 w-2/3 rounded" />
            <div className="mt-auto flex items-center justify-between">
              <SkeletonBlock className="h-3 w-16 rounded" />
              <SkeletonBlock className="size-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MissionListSkeleton() {
  return (
    <div className="flex flex-col gap-7 px-4 pt-4">
      {["mission-a", "mission-b"].map((key) => (
        <div
          key={key}
          className="rounded-[14px] bg-white p-[14px] shadow-[0_2px_6px_rgba(23,23,23,0.06)]"
        >
          <div className="flex items-start gap-[11px]">
            <SkeletonBlock className="size-[65px] shrink-0 rounded-[10px]" />
            <div className="min-w-0 flex-1 pt-1">
              <SkeletonBlock className="h-4 w-3/4 rounded" />
              <SkeletonBlock className="mt-2 h-3 w-full rounded" />
              <SkeletonBlock className="mt-1 h-3 w-2/3 rounded" />
              <SkeletonBlock className="mt-2 h-3 w-16 rounded" />
            </div>
          </div>
          <SkeletonBlock className="mt-[14px] h-[42px] w-full rounded-[16px]" />
        </div>
      ))}
    </div>
  );
}

function PlanMissionSkeleton() {
  return (
    <div aria-label="Loading missions" className="pb-[108px]">
      <section className="pb-6 pt-5">
        <div className="mb-4 flex items-center justify-between px-4">
          <SkeletonBlock className="h-5 w-28 rounded" />
          <SkeletonBlock className="size-6 rounded-full" />
        </div>
        <RecommendationSkeleton />
      </section>
      <div className="h-[6px] bg-surface" />
      <section className="px-4 pt-5">
        <div className="flex items-end justify-between">
          <SkeletonBlock className="h-10 w-24 rounded" />
          <SkeletonBlock className="h-4 w-16 rounded" />
        </div>
        <SkeletonBlock className="mt-4 h-2 w-full rounded-full" />
      </section>
      <div className="mt-6 flex gap-[13px] overflow-hidden px-4 pb-2">
        {["filter-a", "filter-b", "filter-c", "filter-d"].map((key) => (
          <SkeletonBlock key={key} className="h-6 w-16 shrink-0 rounded-full" />
        ))}
      </div>
      <MissionListSkeleton />
    </div>
  );
}

function Photo({
  url,
  title,
  className,
}: {
  url: string | null;
  title: string;
  className: string;
}) {
  return url ? (
    <img src={url} alt={title} className={`${className} object-cover`} />
  ) : (
    <div
      className={`${className} flex items-center justify-center bg-surface text-muted`}
    >
      <CameraIcon size={28} />
    </div>
  );
}

function PlanMissionContent({ planId }: { planId: string }) {
  const t = useTranslations("plan.missions");
  const locale = useLocale();
  const router = useRouter();
  const openDetail = useMissionSheetStore((s) => s.openDetail);
  const [filter, setFilter] = useState<PlanMissionFilter>("ALL");
  const all = usePlanMissions(planId, "ALL");
  const filtered = usePlanMissions(planId, filter);
  const recommendations = usePlanMissionRecommendations(planId);
  const add = useAddPlanMission();
  const upload = useUploadPlanMissionProof();
  const authenticate = useAuthenticatePlanMission();
  const publish = usePublishPlanMission();
  const [flow, setFlow] = useState<ProofFlow | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingAddId, setPendingAddId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const sequence = useRef(0);
  const activeSeq = useRef<number | null>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const pendingCameraMission = useRef<PlanMission | null>(null);
  const auth = usePlanMissionAuthentication(
    planId,
    flow?.mission.userMissionId ?? null,
    !!flow,
  );

  useEffect(
    () => () => {
      activeSeq.current = null;
      pendingCameraMission.current = null;
    },
    [],
  );

  useEffect(() => {
    if (!flow?.file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(flow.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [flow?.file]);

  const closeFlowAfterSave = () => {
    activeSeq.current = null;
    pendingCameraMission.current = null;
    setFlow(null);
    setUploadedUrl(null);
    setContent("");
    setError("");
  };
  const closeFlow = () => {
    if (savingRef.current) return;
    closeFlowAfterSave();
    if (cameraInput.current) cameraInput.current.value = "";
  };
  const startFlow = (mission: PlanMission) => {
    pendingCameraMission.current = null;
    const seq = ++sequence.current;
    activeSeq.current = seq;
    setUploadedUrl(null);
    setContent("");
    setError("");
    setFlow({
      mission,
      seq,
      file: null,
      stage: "compose",
    });
  };
  const openCamera = (mission?: PlanMission) => {
    if (savingRef.current) return;
    pendingCameraMission.current = mission ?? null;
    cameraInput.current?.click();
  };
  const chooseFile = (file?: File) => {
    if (!file) {
      pendingCameraMission.current = null;
      return;
    }
    if (savingRef.current) return;
    const mission = pendingCameraMission.current;
    pendingCameraMission.current = null;
    setUploadedUrl(null);
    setError("");
    if (mission) {
      const seq = ++sequence.current;
      activeSeq.current = seq;
      setContent("");
      setFlow({ mission, seq, file, stage: "proof" });
    } else if (flow) {
      setFlow({ ...flow, file, stage: "proof" });
    }
  };
  const openMission = (mission: PlanMission | PlanMissionRecommendation) => {
    openDetail(
      mission.missionId,
      {
        title: mission.title,
        imageUrl: mission.imageUrl,
        difficulty: mission.difficulty,
      },
      planId,
    );
  };
  const addRecommendation = async (mission: PlanMissionRecommendation) => {
    if (add.isPending) return;
    setPendingAddId(mission.missionId);
    setActionError("");
    try {
      await add.mutateAsync({ planId, missionId: mission.missionId });
    } catch (cause) {
      setActionError(getApiErrorMessage(cause, t("actionError")));
    } finally {
      setPendingAddId(null);
    }
  };
  const saveProof = async (current: ProofFlow) => {
    if (current.mission.status !== "PROOF_REQUIRED") return true;
    if (!current.file) {
      setError(t("photoRequired"));
      return false;
    }
    let url = uploadedUrl;
    try {
      if (!url) {
        url = await upload.mutateAsync({ file: current.file });
        if (activeSeq.current !== current.seq) return false;
        setUploadedUrl(url);
      }
      await authenticate.mutateAsync({
        planId,
        userMissionId: current.mission.userMissionId,
        proofImageUrl: url,
      });
      return activeSeq.current === current.seq;
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        const latest = await auth.refetch();
        if (activeSeq.current !== current.seq) return false;
        setError(
          latest.data?.status === "COMPLETED"
            ? t("alreadyCompleted")
            : t("proofConflict"),
        );
      } else if (activeSeq.current === current.seq)
        setError(getApiErrorMessage(cause, t("proofError")));
      return false;
    }
  };
  const confirmProof = async () => {
    const current = flow;
    if (!current || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      if (!(await saveProof(current))) return;
      await auth.refetch();
      if (activeSeq.current === current.seq)
        setFlow({
          ...current,
          mission: { ...current.mission, status: "UPLOAD_PENDING" },
          file: null,
          stage: "compose",
        });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  const submit = async () => {
    const current = flow;
    if (!current || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setError("");
    try {
      const latest = await auth.refetch();
      if (activeSeq.current !== current.seq) return;
      if (!latest.isSuccess) {
        setError(t("authenticationRecheckError"));
        return;
      }
      if (isCompletedAfterRefresh(latest)) {
        setError(t("alreadyCompleted"));
        return;
      }
      if (!canPublishAfterRefresh(latest)) {
        setError(t("savedPhotoError"));
        return;
      }
      try {
        await publish.mutateAsync({
          planId,
          userMissionId: current.mission.userMissionId,
          content: content.trim() || null,
        });
        if (activeSeq.current === current.seq) closeFlowAfterSave();
      } catch (cause) {
        const latest = await auth.refetch();
        if (activeSeq.current !== current.seq) return;
        if (isCompletedAfterRefresh(latest)) closeFlowAfterSave();
        else
          setError(
            latest.isSuccess
              ? getApiErrorMessage(cause, t("publishUncertain")) +
                  " " +
                  t("publishRetryHint")
              : t("authenticationRecheckError"),
          );
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const list = filter === "ALL" ? all : filtered;
  const counts = all.data;
  const achieved = counts
    ? counts.uploadPendingCount + counts.completedCount
    : 0;
  const percent = counts ? planMissionProgress(counts) * 100 : 0;
  const filterCounts = [
    counts?.totalCount,
    counts?.proofRequiredCount,
    counts?.uploadPendingCount,
    counts?.completedCount,
  ];
  const isMissingPlan =
    all.error instanceof ApiError && all.error.status === 404;
  const shownPhoto = previewUrl ?? auth.data?.proofImageUrl ?? null;

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-white">
      <PlanHeader title={counts?.planName ?? ""} />
      <main className="min-h-0 flex-1 overflow-y-auto pb-[108px] scrollbar-hide">
        {all.isPending ? (
          <motion.div key="loading" {...fadeSwap} className="min-h-full">
            <PlanMissionSkeleton />
          </motion.div>
        ) : all.isError ? (
          <motion.div
            key="error"
            {...fadeSwap}
            className="px-4 py-16 text-center"
          >
            <p className="text-sm text-subtext">
              {isMissingPlan ? t("noPlan") : t("loadError")}
            </p>
            <button
              type="button"
              onClick={() =>
                isMissingPlan
                  ? router.push(`/${locale}/onboarding`)
                  : all.refetch()
              }
              className="mt-4 rounded-full bg-dark px-5 py-2 text-xs font-semibold text-white"
            >
              {isMissingPlan ? t("createPlan") : t("retry")}
            </button>
          </motion.div>
        ) : (
          <motion.div key="ready" {...fadeSwap}>
            <motion.section {...sectionEnter(1)} className="pb-6 pt-5">
              <div className="mb-4 flex items-center justify-between px-4">
                <h2 className="text-[15px] font-semibold text-dark">
                  {t("recommendations")}
                </h2>
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/mission`)}
                  aria-label={t("explore")}
                >
                  <ArrowForwardIcon size={24} />
                </button>
              </div>
              {recommendations.isPending ? (
                <RecommendationSkeleton />
              ) : recommendations.isError ? (
                <div className="px-4 text-xs text-subtext">
                  {t("recommendationError")}{" "}
                  <button
                    type="button"
                    onClick={() => recommendations.refetch()}
                    className="underline"
                  >
                    {t("retry")}
                  </button>
                </div>
              ) : !recommendations.data ? (
                <div className="mx-4 rounded-2xl bg-surface px-5 py-8 text-center">
                  <p className="whitespace-pre-line text-sm text-subtext">
                    {t("noCourse")}
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/plan/${planId}`)}
                    className="mt-4 rounded-xl bg-lime-vivid px-5 py-2 text-xs font-semibold"
                  >
                    {t("createPlan")}
                  </button>
                </div>
              ) : recommendations.data.missions.length === 0 ? (
                <p className="px-4 text-xs text-subtext">
                  {t("noRecommendations")}
                </p>
              ) : (
                <div className="flex gap-[19px] overflow-x-auto px-4 pb-1 scrollbar-hide">
                  <AnimatePresence initial={false}>
                    {recommendations.data.missions.map((mission, index) => {
                      const added = !!counts?.missions.some(
                        (item) => item.missionId === mission.missionId,
                      );
                      const adding = pendingAddId === mission.missionId;
                      const cardEnter = listItemEnter(index);
                      return (
                        <motion.article
                          key={mission.missionId}
                          {...cardEnter}
                          layout="position"
                          exit={fadeSwap.exit}
                          transition={{
                            ...cardEnter.transition,
                            layout: layoutShift,
                          }}
                          className="w-[220px] shrink-0 overflow-hidden rounded-[14px] bg-surface"
                        >
                          <button
                            type="button"
                            onClick={() => openMission(mission)}
                            className="relative block w-full text-left"
                          >
                            <Photo
                              url={mission.imageUrl}
                              title={mission.title}
                              className="h-[122px] w-full"
                            />
                            {mission.tags[0]?.trim() && (
                              <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[11px] font-medium leading-none text-dark shadow-sm">
                                {mission.tags[0].trim().startsWith("#")
                                  ? mission.tags[0].trim()
                                  : `#${mission.tags[0].trim()}`}
                              </span>
                            )}
                          </button>
                          <div className="relative flex h-[136px] flex-col px-3 pb-3 pt-2">
                            <button
                              type="button"
                              onClick={() => openMission(mission)}
                              className="text-left"
                            >
                              <h3 className="line-clamp-1 text-[15px] font-semibold text-dark">
                                {mission.title}
                              </h3>
                              <p className="mt-1 line-clamp-2 text-[12px] leading-[1.4] text-subtext">
                                {mission.description}
                              </p>
                            </button>
                            <div className="mt-auto flex items-end justify-between">
                              <DifficultyStars
                                difficulty={mission.difficulty}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  added
                                    ? openMission(mission)
                                    : addRecommendation(mission)
                                }
                                disabled={adding}
                                aria-busy={adding}
                                aria-label={added ? t("added") : t("add")}
                                className={`flex size-8 items-center justify-center rounded-full disabled:cursor-wait ${added ? "bg-lime-vivid text-dark" : "bg-dark text-white"}`}
                              >
                                {adding ? (
                                  <Spinner />
                                ) : added ? (
                                  <CheckIcon size={19} />
                                ) : (
                                  <PlusIcon size={18} />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>
            <motion.div
              {...sectionEnter(2, true)}
              className="h-[6px] bg-surface"
            />
            <motion.section {...sectionEnter(2)} className="px-4 pt-5">
              <div className="flex items-end justify-between">
                <div>
                  <strong className="text-[40px] font-semibold leading-none text-dark">
                    {achieved}
                  </strong>
                  <span className="ml-2 text-[15px] text-subtext">
                    / {t("totalAchieved", { count: counts?.totalCount ?? 0 })}
                  </span>
                </div>
                <span className="pb-1 text-[12px] text-subtext">
                  {t("myMissions")}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={achieved}
                aria-valuemin={0}
                aria-valuemax={counts?.totalCount ?? 0}
                aria-label={t("myMissions")}
                className="mt-4 h-2 overflow-hidden rounded-full bg-surface"
              >
                <motion.div
                  className="h-full rounded-full bg-lime-vivid"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={tabIndicator}
                />
              </div>
            </motion.section>
            <motion.div
              {...sectionEnter(3)}
              role="tablist"
              aria-label={t("filtersLabel")}
              className="mt-6 flex gap-[13px] overflow-x-auto px-4 pb-2 scrollbar-hide"
            >
              {FILTERS.map((item, i) => (
                <motion.button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={filter === item}
                  onClick={() => setFilter(item)}
                  whileTap={TAP.button}
                  className={`relative shrink-0 rounded-full px-3 py-1 text-[12px] ${filter === item ? "text-white" : "bg-surface text-subtext"}`}
                >
                  {filter === item && (
                    <motion.span
                      layoutId="plan-mission-filter-indicator"
                      transition={tabIndicator}
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-dark"
                    />
                  )}
                  <span className="relative z-10">
                    {t(`filters.${item}`)} {filterCounts[i] ?? 0}
                  </span>
                </motion.button>
              ))}
            </motion.div>
            <AnimatePresence mode="wait" initial={false}>
              {list.isPending ? (
                <motion.div
                  key={`loading-${filter}`}
                  {...fadeSwap}
                  className="min-h-[300px]"
                >
                  <MissionListSkeleton />
                </motion.div>
              ) : list.isError ? (
                <motion.div
                  key={`error-${filter}`}
                  {...fadeSwap}
                  className="py-12 text-center text-sm text-subtext"
                >
                  {t("loadError")}{" "}
                  <button
                    type="button"
                    onClick={() => list.refetch()}
                    className="underline"
                  >
                    {t("retry")}
                  </button>
                </motion.div>
              ) : list.data?.missions.length === 0 ? (
                <motion.button
                  type="button"
                  key={`empty-${filter}`}
                  {...fadeSwap}
                  onClick={() => router.push(`/${locale}/mission`)}
                  className="mx-4 mt-4 flex min-h-[111px] w-[calc(100%-2rem)] flex-col items-center justify-center rounded-[14px] bg-white px-[75px] py-[34px] text-center shadow-[0_2px_6px_rgba(23,23,23,0.06)] transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2"
                >
                  <p className="text-[15px] font-semibold leading-[1.4] tracking-[-0.3px] text-dark">
                    {filter === "ALL"
                      ? t("noMissions")
                      : t("noFilteredMissions")}
                  </p>
                  <p className="mt-[3px] text-[12px] font-medium leading-[1.6] text-muted">
                    {filter === "ALL" ? t("browse") : t("explore")}
                  </p>
                </motion.button>
              ) : (
                <motion.div
                  key={`list-${filter}`}
                  {...fadeSwap}
                  className="flex flex-col gap-7 px-4 pt-4"
                >
                  {list.data?.missions.map((mission, index) => (
                    <motion.article
                      key={mission.userMissionId}
                      {...listItemEnter(index)}
                      className="rounded-[14px] bg-white p-[14px] shadow-[0_2px_6px_rgba(23,23,23,0.06)]"
                    >
                      <button
                        type="button"
                        onClick={() => openMission(mission)}
                        className="flex w-full items-start gap-[11px] text-left"
                      >
                        <Photo
                          url={mission.imageUrl}
                          title={mission.title}
                          className="size-[65px] shrink-0 rounded-[10px]"
                        />
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 text-[15px] font-semibold text-dark">
                            {mission.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-[12px] text-subtext">
                            {mission.description}
                          </p>
                          <div className="mt-1">
                            <DifficultyStars difficulty={mission.difficulty} />
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          mission.status === "COMPLETED"
                            ? router.push(
                                `/${locale}/mission/feed?tab=completed`,
                              )
                            : mission.status === "PROOF_REQUIRED"
                              ? openCamera(mission)
                              : startFlow(mission)
                        }
                        className={`mt-[14px] h-[42px] w-full rounded-[16px] text-[14px] font-semibold ${mission.status === "PROOF_REQUIRED" ? "bg-lime-vivid text-dark" : mission.status === "UPLOAD_PENDING" ? "bg-dark text-lime-vivid" : "bg-surface text-subtext"}`}
                      >
                        {t(`actions.${mission.status}`)}
                      </button>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {actionError && (
              <p
                role="alert"
                className="px-4 pt-4 text-center text-xs text-red-600"
              >
                {actionError}
              </p>
            )}
          </motion.div>
        )}
      </main>
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label={t("takePhoto")}
        onChange={(event) => {
          chooseFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <BottomSheet
        open={!!flow}
        title={flow?.mission.title ?? ""}
        onClose={closeFlow}
        closeLabel={t("close")}
        animated
        contentMode="fill"
      >
        {flow && (
          <div
            key={flow.seq}
            className="flex h-full min-h-0 flex-col overflow-y-auto px-4 pb-5 scrollbar-hide"
          >
            <>
              {auth.isPending && !flow.file ? (
                <p className="py-16 text-center text-sm text-subtext">
                  {t("loadingPhoto")}
                </p>
              ) : auth.isError && !flow.file ? (
                <div className="py-16 text-center text-sm text-subtext">
                  {t("savedPhotoError")}{" "}
                  <button
                    type="button"
                    onClick={() => auth.refetch()}
                    className="underline"
                  >
                    {t("retry")}
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (!saving && flow.mission.status === "PROOF_REQUIRED")
                        openCamera();
                    }}
                    aria-label={t("replacePhoto")}
                    className="mt-2 w-full"
                  >
                    <Photo
                      url={shownPhoto}
                      title={flow.mission.title}
                      className="aspect-[343/387] w-full rounded-xl"
                    />
                  </button>
                  {flow.mission.status === "PROOF_REQUIRED" && (
                    <button
                      type="button"
                      onClick={() => openCamera()}
                      disabled={saving}
                      className="mt-2 self-end text-xs text-subtext underline"
                    >
                      {t("replacePhoto")}
                    </button>
                  )}
                  {flow.stage === "compose" && (
                    <label className="mt-4 block rounded-[14px] bg-surface p-[14px]">
                      <span className="sr-only">{t("contentLabel")}</span>
                      <textarea
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        maxLength={1000}
                        placeholder={t("contentPlaceholder")}
                        className="h-28 w-full resize-none bg-transparent text-[14px] outline-none"
                      />
                      <span className="block text-right text-[12px] text-subtext">
                        {t("characterCount", { count: content.length })}
                      </span>
                    </label>
                  )}
                  {error && (
                    <p role="alert" className="mt-3 text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  <div className="mt-auto pt-5">
                    {flow.stage === "proof" ? (
                      <button
                        type="button"
                        disabled={saving || !flow.file}
                        aria-busy={saving}
                        onClick={confirmProof}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-dark text-[15px] font-semibold text-lime-vivid disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-70"
                      >
                        {saving && <Spinner />}
                        {saving ? t("saving") : t("completeProof")}
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={saving || !auth.data?.proofImageUrl}
                          aria-busy={saving}
                          onClick={submit}
                          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-lime-vivid text-[15px] font-semibold disabled:opacity-50 aria-busy:cursor-wait aria-busy:opacity-70"
                        >
                          {saving && <Spinner />}
                          {saving ? t("saving") : t("publish")}
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={closeFlow}
                          className="mt-3 w-full py-2 text-[13px] text-subtext underline disabled:opacity-50"
                        >
                          {t("skipPublish")}
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}

export default function PlanMissionPage() {
  const { planId } = useParams<{ planId: string }>();
  return <PlanMissionContent key={planId} planId={planId} />;
}
