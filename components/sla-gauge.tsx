import { gaugeColor } from "@/lib/sla-data";

// 270° 아크 게이지 (프로토타입 이식)
export default function SlaGauge({ value }: { value: number }) {
  const size = 220;
  const r = 92;
  const cx = size / 2;
  const cy = size / 2 + 6;
  const startAngle = -225;
  const sweep = 270;
  const pct = Math.max(0, Math.min(100, value)) / 100;

  const pt = (angleDeg: number, radius: number): [number, number] => {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
  };
  const arcPath = (a0: number, a1: number, radius: number) => {
    const [x0, y0] = pt(a0, radius);
    const [x1, y1] = pt(a1, radius);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 1 ${x1} ${y1}`;
  };
  const tickLine = (angle: number, key: string) => {
    const [ix, iy] = pt(angle, r - 9);
    const [ox, oy] = pt(angle, r + 9);
    return (
      <line
        key={key}
        x1={ix}
        y1={iy}
        x2={ox}
        y2={oy}
        stroke="#C8C2B2"
        strokeWidth={2}
      />
    );
  };

  const { c } = gaugeColor(value);

  return (
    <svg
      viewBox={`0 0 ${size} ${size - 30}`}
      style={{ height: 160, overflow: "visible" }}
    >
      <path
        d={arcPath(startAngle, startAngle + sweep, r)}
        fill="none"
        stroke="#EFEBE2"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {tickLine(startAngle + sweep * 0.7, "t70")}
      {tickLine(startAngle + sweep * 0.85, "t85")}
      <path
        d={arcPath(startAngle, startAngle + sweep * pct, r)}
        fill="none"
        stroke={c}
        strokeWidth={14}
        strokeLinecap="round"
      />
    </svg>
  );
}
