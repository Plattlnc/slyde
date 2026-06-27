// 프로필 꾸미기 옵션 (slydeV3.html 기준)

export const PE_AVATARS = [
  "🛵", "🏍️", "⚡", "🦺", "🚀", "🌙", "🔥", "😎", "🐢", "🦅",
];

export const PE_NAME_EMOJIS = [
  "", "⚡", "🔥", "👑", "🛡️", "🌟", "💨", "😎", "🚀", "❄️",
];

export type BadgeKey =
  | "safe" | "night" | "master" | "vet" | "kind" | "rain" | "speed" | "star";

export const BADGE_CATALOG: Record<BadgeKey, { l: string; i: string }> = {
  safe: { l: "안전운행왕", i: "🛡️" },
  night: { l: "심야의제왕", i: "🌙" },
  master: { l: "1000건 달성", i: "🎯" },
  vet: { l: "베테랑", i: "👑" },
  kind: { l: "친절왕", i: "😊" },
  rain: { l: "우천불사", i: "☔" },
  speed: { l: "스피드킹", i: "💨" },
  star: { l: "이달의 라이더", i: "🌟" },
};

export const BADGE_KEYS = Object.keys(BADGE_CATALOG) as BadgeKey[];
export const BADGE_MAX = 3;
