export type Transport = "walking" | "publicTransit" | "car";

// 여행 대분류 (i18n categories.* 키 및 SUB_CATEGORIES 키와 일치)
export type Category =
  | "food"
  | "experience"
  | "nature"
  | "history"
  | "culture"
  | "shopping"
  | "festival"
  | "leisure";

export type Level = "light" | "normal" | "deep";

export type OnboardingData = {
  tripName: string;
  region: string; // 화면 표시용 지역명 (displayName)
  regionId: number | null; // 서버 전송용 지역 ID. 미선택/미정이면 null
  regionUndecided: boolean;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: number;
  timeEnd: number;
  transport: Transport[];
  categories: Category[];
  subCategories: string[];
  level: Level | "";
};
