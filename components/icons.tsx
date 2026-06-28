// 일관된 라인 아이콘 세트 (currentColor, 24 viewBox)
type P = { size?: number; className?: string };

function Svg({
  size = 22,
  className,
  children,
  fill = "none",
}: P & { children: React.ReactNode; fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function HeartIcon({ filled, ...p }: P & { filled?: boolean }) {
  return (
    <Svg {...p} fill={filled ? "currentColor" : "none"}>
      <path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 1 1 7.1-7.1l.4.4.4-.4a5 5 0 1 1 7.1 7.1z" />
    </Svg>
  );
}
export function CommentIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3.5 20.5l1.5-5A8.5 8.5 0 1 1 21 11.5z" />
    </Svg>
  );
}
export function RepostIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Svg>
  );
}
export function ShareIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M22 2 11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </Svg>
  );
}
export function BellIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}
export function SearchIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Svg>
  );
}
export function MenuIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

/* 작성창 아이콘 */
export function ImageIcon(p: P) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="8.5" cy="8.5" r="1.6" />
      <path d="M21 14l-4.5-4.5L5 20.5" />
    </Svg>
  );
}
export function VideoIcon(p: P) {
  return (
    <Svg {...p}>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10.5l5-3v9l-5-3z" />
    </Svg>
  );
}
export function EmojiIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10h.01M15.5 10h.01" />
      <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" />
    </Svg>
  );
}
export function LocationIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </Svg>
  );
}

/* 메뉴 항목 아이콘 */
export function ChartIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 20h16" />
      <path d="M7 20v-5" />
      <path d="M12 20V8" />
      <path d="M17 20v-9" />
    </Svg>
  );
}
export function TrophyIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
      <path d="M7 5H4v1a3 3 0 0 0 3 3" />
      <path d="M17 5h3v1a3 3 0 0 1-3 3" />
      <path d="M12 13v4" />
      <path d="M8.5 21h7l-.5-3h-6l-.5 3z" />
    </Svg>
  );
}
export function AlertIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </Svg>
  );
}
export function WrenchIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M15 6.5a3.5 3.5 0 0 0 4.4 4.4l-9.3 9.3a2.1 2.1 0 0 1-3-3l9.3-9.3a3.5 3.5 0 0 0-1.4-1.4z" />
    </Svg>
  );
}
export function KeyIcon(p: P) {
  return (
    <Svg {...p}>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11l9 9" />
      <path d="M17 17l2-2" />
    </Svg>
  );
}
export function CarIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 13l1.6-4.2A2 2 0 0 1 7.5 7.5h9a2 2 0 0 1 1.9 1.3L20 13" />
      <path d="M3 13h18v4H3z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </Svg>
  );
}
export function BagIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </Svg>
  );
}
export function FuelIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
      <path d="M3 20h12" />
      <path d="M7 10h4" />
      <path d="M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0V8l-2.5-2.5" />
    </Svg>
  );
}
export function FoodIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 11h16" />
      <path d="M6 11a6 6 0 0 1 12 0" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 4c-1.2.7-1.2 1.8 0 2.5" />
    </Svg>
  );
}
export function NewsIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M4 5h12v14a1 1 0 0 1-1 1H4z" />
      <path d="M16 8h3a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2" />
      <path d="M7 9h6M7 12h6M7 15h4" />
    </Svg>
  );
}
export function BuildingIcon(p: P) {
  return (
    <Svg {...p}>
      <path d="M5 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17" />
      <path d="M3 21h18" />
      <path d="M8.5 7h1M12 7h1M8.5 11h1M12 11h1M8.5 15h1M12 15h1" />
    </Svg>
  );
}
