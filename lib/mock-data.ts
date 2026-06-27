// 목업 데이터 — 추후 스크랩핑/백엔드 팀 API로 교체
// (배달장부 스크랩핑 → 개인 SLA 대시보드)

export type RiderProfile = {
  name: string;
  tier: "개인회원" | "협력사회원" | "기업회원";
  company?: string;
  avatarEmoji: string;
};

export const rider: RiderProfile = {
  name: "김라이더",
  tier: "협력사회원",
  company: "번개배송",
  avatarEmoji: "🛵",
};

export type SlaStat = {
  label: string;
  value: string;
  unit?: string;
  trend?: string; // 예: "+12%"
  good?: boolean;
};

// 오늘의 SLA 요약 지표
export const slaStats: SlaStat[] = [
  { label: "완료 콜", value: "37", unit: "건", trend: "+5", good: true },
  { label: "오늘 수입", value: "184,500", unit: "원", trend: "+12%", good: true },
  { label: "평균 배달", value: "21", unit: "분", trend: "-2분", good: true },
  { label: "SLA 달성률", value: "96.4", unit: "%", trend: "+1.2%", good: true },
];

export type AdBanner = {
  id: string;
  title: string;
  subtitle: string;
  sponsor: string;
  gradient: string; // tailwind gradient classes
};

export const adBanners: AdBanner[] = [
  {
    id: "olca",
    title: "라이더 전용 차량 리스",
    subtitle: "월 0원 첫 달 프로모션",
    sponsor: "올카",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: "lightwagen",
    title: "전기 이륜차 신차 출시",
    subtitle: "보조금 최대 적용",
    sponsor: "라이트바겐",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "lease",
    title: "라이더 맞춤 보험",
    subtitle: "사고 걱정 끝, 가입 즉시",
    sponsor: "리스사",
    gradient: "from-orange-500 to-rose-600",
  },
];

export type QuickService = {
  id: string;
  label: string;
  emoji: string;
  href: string;
  highlight?: boolean;
};

export const quickServices: QuickService[] = [
  { id: "accident", label: "사고 접수", emoji: "🚨", href: "/accident" },
  { id: "center", label: "서비스센터", emoji: "🔧", href: "/centers" },
  { id: "sos", label: "긴급출동", emoji: "🆘", href: "/sos", highlight: true },
  { id: "mini", label: "입점사", emoji: "🏪", href: "/partners" },
];

// ── SNS 피드 (Threads 스타일 홈) ──────────────────────────────
export type FeedPost = {
  id: string;
  author: string;
  tier: "개인회원" | "협력사회원" | "기업회원";
  company?: string;
  avatarEmoji: string;
  avatarUrl?: string | null; // 작성자 프로필 사진(있으면 우선)
  time: string; // 상대 시간 표기 (예: "2시간")
  text: string;
  image?: { emoji: string; gradient: string }; // 이미지 자리 (mock 데모)
  images?: string[]; // 실제 첨부 사진/gif URL들
  videoUrl?: string | null; // 첨부 동영상
  replies: number;
  reposts: number;
  likes: number;
  shares?: number;
  liked?: boolean;
  verified?: boolean; // 인증 라이더
  sponsored?: { sponsor: string; cta: string }; // 스폰서(광고) 글
  // ── 실제 DB 글에만 세팅 (mock 글은 undefined) ──
  real?: boolean; // DB에 존재하는 실제 글
  authorId?: string; // 작성자 user id (프로필 링크)
  mine?: boolean; // 내가 쓴 글 (삭제 가능)
  likedByMe?: boolean; // 내가 좋아요 눌렀는지
};

export const feedPosts: FeedPost[] = [
  {
    id: "f1",
    author: "라이더왕",
    tier: "협력사회원",
    company: "번개배송",
    avatarEmoji: "🏍️",
    time: "12분",
    text: "오늘 점심 피크 미쳤다… 1시간에 9콜 뛰고 왔음 ㅋㅋ 다들 안전운행 하세요 🔥",
    replies: 23,
    reposts: 4,
    likes: 142,
    verified: true,
  },
  {
    id: "f2",
    author: "초보기사_민수",
    tier: "개인회원",
    avatarEmoji: "🧑‍🦱",
    time: "38분",
    text: "전기 이륜차 입문했는데 한 번 충전으로 어디까지 가시나요? 도심 위주로 뛰는데 너무 자주 충전하는 느낌이라 ㅠㅠ",
    replies: 56,
    reposts: 2,
    likes: 31,
  },
  {
    id: "ad1",
    author: "올카",
    tier: "기업회원",
    avatarEmoji: "🚗",
    time: "",
    text: "라이더 전용 차량 리스, 첫 달 0원! 신용 조회 없이 바로 상담 가능합니다. slyde 회원 추가 혜택까지 🎁",
    image: { emoji: "🚙", gradient: "from-blue-500 to-indigo-600" },
    replies: 8,
    reposts: 1,
    likes: 67,
    sponsored: { sponsor: "올카", cta: "상담 신청" },
  },
  {
    id: "f3",
    author: "강남터줏대감",
    tier: "협력사회원",
    company: "퀵세이버",
    avatarEmoji: "🛵",
    time: "1시간",
    text: "강남대로 공사 구간 우회로 공유합니다. 테헤란로 쪽으로 빠지는 게 훨씬 빨라요. 지도 첨부 ⬇️",
    image: { emoji: "🗺️", gradient: "from-emerald-500 to-teal-600" },
    replies: 41,
    reposts: 28,
    likes: 203,
    verified: true,
  },
  {
    id: "f4",
    author: "야간전문",
    tier: "개인회원",
    avatarEmoji: "🌙",
    time: "2시간",
    text: "새벽 배달 단골손님이 핫팩 챙겨주심… 이 맛에 야간 뛴다 진짜 🥹",
    replies: 17,
    reposts: 3,
    likes: 188,
  },
  {
    id: "f5",
    author: "안전제일",
    tier: "협력사회원",
    company: "번개배송",
    avatarEmoji: "🦺",
    time: "3시간",
    text: "빗길 사고 날 뻔… 다들 우천 시 속도 진짜 줄이세요. 보험 처리도 slyde 사고접수로 5분 만에 끝냈습니다.",
    replies: 34,
    reposts: 12,
    likes: 96,
    verified: true,
  },
];

export type CommunityPost = {
  id: string;
  board: "일상/유머" | "질문/답변" | "사건/사고";
  title: string;
  author: string;
  likes: number;
  comments: number;
};

export const hotPosts: CommunityPost[] = [
  {
    id: "p1",
    board: "사건/사고",
    title: "강남대로 빗길 미끄러짐 주의… 다들 조심하세요",
    author: "익명라이더",
    likes: 128,
    comments: 42,
  },
  {
    id: "p2",
    board: "질문/답변",
    title: "전기 이륜차 보조금 신청 어떻게 하셨나요?",
    author: "초보기사",
    likes: 64,
    comments: 31,
  },
  {
    id: "p3",
    board: "일상/유머",
    title: "오늘 단골 손님이 음료수 주심 ㅋㅋ 훈훈",
    author: "베테랑",
    likes: 203,
    comments: 18,
  },
];
