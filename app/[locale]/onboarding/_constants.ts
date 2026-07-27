// 지역 칩 (고정 순서)
export const REGIONS = [
  "서울", "부산", "인천", "제주", "전주", "경주",
  "강릉", "속초", "대구", "광주", "여수", "춘천",
];

// 이동 수단
export const TRANSPORTS = ["walking", "publicTransit", "car"] as const;

// 대분류
export const CATEGORIES = [
  "food", "experience", "nature", "history",
  "culture", "shopping", "festival", "leisure",
] as const;

// 중분류
export const SUB_CATEGORIES: Record<string, string[]> = {
  food: ["한식", "카페·찻집", "주점", "다 좋아요"],
  experience: ["전통체험", "산사체험", "이색체험"],
  nature: ["산·숲", "바다·해변", "호수·강", "섬", "공원"],
  history: ["궁궐", "유적지", "박물관", "전통 마을"],
  culture: ["갤러리", "공연·뮤지컬", "거리 예술", "사찰"],
  shopping: ["전통시장", "로컬 숍", "면세점", "빈티지"],
  festival: ["축제", "공연·행사", "불꽃놀이", "야시장"],
  leisure: ["서핑", "스키", "등산", "자전거", "수상스포츠"],
};

export const LEVELS = ["light", "normal", "deep"] as const;
