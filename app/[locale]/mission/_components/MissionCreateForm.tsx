/**
 * @component MissionCreateForm
 * 미션 생성 폼 본체(예시 사진·제목·설명·난이도·해시태그·제출 버튼). 인터셉트 바텀시트와
 * 단독 페이지 두 껍데기가 공통으로 렌더링한다. X/취소 등 화면 전환은 상위 껍데기 책임이며,
 * 이 컴포넌트는 폼 상태와 제출만 담당한다.
 */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import InputText from "@/app/_components/ui/InputText";
import TextArea from "@/app/_components/ui/TextArea";
import BigButton from "@/app/_components/ui/BigButton";
import { CameraIcon, StarIcon } from "@/app/_components/icons";
import { useCreateMission } from "../_hooks/useMissionQueries";
import {
  DEFAULT_HASHTAGS,
  DIFFICULTIES,
  TITLE_MAX,
  DESC_MAX,
} from "../_constants";
import type { Mission, MissionDifficulty } from "@/app/_api/missions";

// 커스텀 해시태그 입력 최대 길이 (기획 재량치)
const CUSTOM_TAG_MAX = 15;

interface MissionCreateFormProps {
  /**
   * 생성 성공 시 생성된 미션과 함께 호출된다(취소 시엔 호출되지 않음).
   * store.open 호출 시점(즉시 vs 퇴장 모션 이후)과 닫힘 모션·라우팅은 상위 껍데기가 처리한다.
   */
  onDone: (created?: Mission) => void;
}

export default function MissionCreateForm({ onDone }: MissionCreateFormProps) {
  const t = useTranslations("mission");
  const createMissionMutation = useCreateMission();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<MissionDifficulty | null>(null);

  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [isTagInputOpen, setIsTagInputOpen] = useState(false);
  const [tagInputValue, setTagInputValue] = useState("");

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 제출 성공 시점의 imagePreviewUrl을 기록한다. mock 저장소가 이 URL을 그대로 들고
  // 생성된 미션 카드 이미지로 계속 참조하므로(=URL 소유권이 폼에서 저장소로 이전됨),
  // 이후 교체·언마운트 cleanup에서는 이 URL만은 revoke하지 않는다.
  // (mock 한정 이슈 — 실서버 연동 시 imageUrl은 업로드 응답으로 받은 별도 URL로 대체되어
  // blob URL 자체를 더 이상 저장소에 넘기지 않게 되므로 이 예외 처리는 자연히 불필요해진다.)
  const submittedUrlRef = useRef<string | null>(null);

  // blob 미리보기 URL(mock 전용, 세션 내에서만 유효)은 교체·언마운트 시 해제한다.
  // 단, 제출 성공으로 소유권이 이전된 URL은 위 정책에 따라 건너뛴다.
  useEffect(() => {
    return () => {
      if (imagePreviewUrl && imagePreviewUrl !== submittedUrlRef.current) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // 동일 파일을 다시 선택해도 change가 발생하도록 초기화
      if (!file) return;
      setImagePreviewUrl((prev) => {
        if (prev && prev !== submittedUrlRef.current) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    },
    [],
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value),
    [],
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setDescription(e.target.value),
    [],
  );

  const handleSelectDifficulty = useCallback((level: MissionDifficulty) => {
    setDifficulty(level);
  }, []);

  const handleTogglePreset = useCallback(
    (key: (typeof DEFAULT_HASHTAGS)[number]) => {
      const label = t(`hashtags.${key}`);
      setSelectedHashtags((prev) =>
        prev.includes(label)
          ? prev.filter((h) => h !== label)
          : [...prev, label],
      );
    },
    [t],
  );

  const handleToggleCustomTag = useCallback((tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((h) => h !== tag) : [...prev, tag],
    );
  }, []);

  const handleOpenTagInput = useCallback(() => {
    setIsTagInputOpen(true);
  }, []);

  const handleTagInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setTagInputValue(e.target.value),
    [],
  );

  // 입력값을 커스텀 태그로 확정한다. 앞의 '#'은 제거하고 표시할 때만 다시 붙인다.
  // closeAfter=false(Enter)면 연속 입력을 위해 입력창을 유지하고, true(blur)면 항상 닫는다.
  const commitTagInput = useCallback(
    (closeAfter: boolean) => {
      // 자르기(slice)가 새 경계 공백을 만들 수 있으므로 trim은 slice 뒤에 한 번 더
      const raw = tagInputValue
        .trim()
        .replace(/^#+/, "")
        .trim()
        .slice(0, CUSTOM_TAG_MAX)
        .trim();
      setTagInputValue("");
      if (raw) {
        const presetLabels = DEFAULT_HASHTAGS.map((key) =>
          t(`hashtags.${key}`),
        );
        const isDuplicate =
          customTags.includes(raw) || presetLabels.includes(raw);
        if (!isDuplicate) {
          setCustomTags((prev) => [...prev, raw]);
          setSelectedHashtags((prev) => [...prev, raw]);
        }
      }
      if (closeAfter || !raw) setIsTagInputOpen(false);
    },
    [tagInputValue, customTags, t],
  );

  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitTagInput(false);
      }
    },
    [commitTagInput],
  );

  const handleTagInputBlur = useCallback(() => {
    commitTagInput(true);
  }, [commitTagInput]);

  const isFormValid = useMemo(
    () =>
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      difficulty !== null,
    [title, description, difficulty],
  );

  const handleSubmit = useCallback(() => {
    if (!isFormValid || difficulty === null) return;
    createMissionMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        hashtags: selectedHashtags,
        imageUrl: imagePreviewUrl,
      },
      {
        onSuccess: (created: Mission) => {
          if (imagePreviewUrl) submittedUrlRef.current = imagePreviewUrl;
          onDone(created);
        },
      },
    );
  }, [
    isFormValid,
    difficulty,
    title,
    description,
    selectedHashtags,
    imagePreviewUrl,
    createMissionMutation,
    onDone,
  ]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-[18px]">
        {/* 예시 사진 (선택) */}
        <div className="flex flex-col gap-[10px]">
          <p className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
            {t("create.photoLabel")}
          </p>
          <button
            type="button"
            onClick={handlePhotoClick}
            className="flex h-[152px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-[14px] border border-dashed border-muted bg-white"
          >
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt={t("create.photoLabel")}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <CameraIcon size={24} className="text-muted" />
                <span className="text-[12px] font-medium text-muted">
                  {t("create.photoAdd")}
                </span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 미션 제목 */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-end justify-between">
            <p className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
              {t("create.titleLabel")} <span className="text-red-400">*</span>
            </p>
            <span className="text-[12px] font-medium text-muted">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <InputText
            value={title}
            onChange={handleTitleChange}
            maxLength={TITLE_MAX}
            placeholder={t("create.titlePlaceholder")}
          />
        </div>

        {/* 미션 설명 */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-end justify-between">
            <p className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
              {t("create.descLabel")} <span className="text-red-400">*</span>
            </p>
            <span className="text-[12px] font-medium text-muted">
              {description.length}/{DESC_MAX}
            </span>
          </div>
          <TextArea
            value={description}
            onChange={handleDescriptionChange}
            maxLength={DESC_MAX}
            placeholder={t("create.descPlaceholder")}
            className="h-[94px]"
          />
        </div>

        {/* 난이도 */}
        <div className="flex flex-col gap-[10px]">
          <p className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
            {t("create.difficultyLabel")}
          </p>
          <div className="flex items-center gap-[13px]">
            {DIFFICULTIES.map((level) => {
              const selected = difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleSelectDifficulty(level)}
                  aria-pressed={selected}
                  aria-label={t("difficultyValue", { level })}
                  className={`flex h-[27px] items-center justify-center gap-[2px] rounded-full border px-[10px] transition-colors ${
                    selected
                      ? "border-lime-vivid bg-lime-pale"
                      : "border-transparent bg-surface"
                  }`}
                >
                  <div
                    className="flex items-center -space-x-1"
                    aria-hidden="true"
                  >
                    {Array.from({ length: level }).map((_, i) => (
                      <StarIcon
                        key={i}
                        size={16}
                        className={selected ? "text-lime-vivid" : "text-muted"}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 해시태그 (선택) */}
        <div className="flex flex-col gap-[10px]">
          <p className="text-[15px] font-semibold tracking-[-0.045px] text-ink">
            {t("create.hashtagLabel")}{" "}
            <span className="text-muted">{t("create.hashtagOptional")}</span>
          </p>
          <div className="flex flex-wrap items-center gap-[9px]">
            {DEFAULT_HASHTAGS.map((key) => {
              const label = t(`hashtags.${key}`);
              const selected = selectedHashtags.includes(label);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTogglePreset(key)}
                  aria-pressed={selected}
                  className={`rounded-full border-[1.5px] px-[12px] py-[4px] text-[12px] font-medium text-subtext transition-colors ${
                    selected
                      ? "border-lime-vivid bg-lime-pale"
                      : "border-transparent bg-surface"
                  }`}
                >
                  #{label}
                </button>
              );
            })}

            {customTags.map((tag) => {
              const selected = selectedHashtags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleCustomTag(tag)}
                  aria-pressed={selected}
                  className={`rounded-full border-[1.5px] px-[12px] py-[4px] text-[12px] font-medium text-subtext transition-colors ${
                    selected
                      ? "border-lime-vivid bg-lime-pale"
                      : "border-transparent bg-surface"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}

            {isTagInputOpen ? (
              <input
                autoFocus
                value={tagInputValue}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onBlur={handleTagInputBlur}
                maxLength={CUSTOM_TAG_MAX + 1}
                placeholder={t("create.tagInputPlaceholder")}
                aria-label={t("create.addTag")}
                className="h-[26px] w-[110px] rounded-full border-2 border-transparent bg-surface px-[12px] text-[12px] font-medium text-ink outline-none focus:border-dark"
              />
            ) : (
              <button
                type="button"
                onClick={handleOpenTagInput}
                className="rounded-full border border-dashed border-muted bg-surface px-[12px] py-[4px] text-[12px] font-medium text-subtext"
              >
                {t("create.addTag")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-[31px]">
        <BigButton
          fullWidth
          disabled={!isFormValid || createMissionMutation.isPending}
          isLoading={createMissionMutation.isPending}
          onClick={handleSubmit}
        >
          {t("create.submit")}
        </BigButton>
      </div>
    </div>
  );
}
