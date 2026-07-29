export type Transport = "walking" | "publicTransit" | "car";

export type Category =
  | "food" | "experience" | "nature" | "history"
  | "culture" | "shopping" | "festival" | "leisure";

export type Level = "light" | "normal" | "deep";

export type OnboardingData = {
  region: string;
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
