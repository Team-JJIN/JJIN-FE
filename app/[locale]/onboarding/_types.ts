export type OnboardingData = {
  region: string;
  regionUndecided: boolean;
  dateStart: string | null;
  dateEnd: string | null;
  timeStart: number;
  timeEnd: number;
  transport: string[];
  categories: string[];
  subCategories: string[];
  level: string;
};
