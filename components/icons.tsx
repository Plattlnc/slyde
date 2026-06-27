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
