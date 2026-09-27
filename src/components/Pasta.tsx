import type { PastaKind } from "@/lib/products";

type Props = {
  kind: PastaKind;
  className?: string;
  color?: string;
  shade?: string;
  style?: React.CSSProperties;
  /** cooked look: no packaging details (e.g. spaghetti band) */
  bare?: boolean;
};

const DARK = "#8a5a00";

export function Pasta({
  kind,
  className,
  color = "var(--color-pasta)",
  shade = "var(--color-pasta-shade)",
  style,
  bare = false,
}: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={style}
      aria-hidden
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes[kind](color, shade, bare)}
    </svg>
  );
}

const shapes: Record<PastaKind, (c: string, s: string, bare: boolean) => React.ReactNode> = {
  penne: (c, s) => {
    // tube with diagonal cuts; x of the left/right cut for a given y
    const lx = (y: number) => 42 - ((y - 78) * 10) / 44;
    const rx = (y: number) => 168 - ((y - 78) * 10) / 44;
    return (
      <g transform="rotate(-32 100 100)">
        <ellipse cx="37" cy="100" rx="7" ry="22.5" transform="rotate(13 37 100)" fill={s} />
        <polygon points="42,78 168,78 158,122 32,122" fill={c} stroke={s} strokeWidth="2" />
        {[86, 94, 102, 110, 117].map((y) => (
          <line key={y} x1={lx(y) + 4} y1={y} x2={rx(y) - 4} y2={y} stroke={s} strokeWidth="2.2" opacity="0.75" />
        ))}
        <line x1="46" y1="82" x2="160" y2="82" stroke="#fff" strokeWidth="3" opacity="0.45" />
        <ellipse cx="163" cy="100" rx="7" ry="22.5" transform="rotate(13 163 100)" fill={c} stroke={s} strokeWidth="2" />
        <ellipse cx="163" cy="100" rx="3.6" ry="15" transform="rotate(13 163 100)" fill={DARK} opacity="0.85" />
      </g>
    );
  },
  rigatoni: (c, s) => (
    <g transform="rotate(-22 100 100)">
      <ellipse cx="42" cy="100" rx="10" ry="32" fill={s} />
      <rect x="42" y="68" width="118" height="64" fill={c} stroke={s} strokeWidth="2" />
      {[77, 86, 95, 104, 113, 122].map((y) => (
        <line key={y} x1="46" y1={y} x2="156" y2={y} stroke={s} strokeWidth="2.4" opacity="0.7" />
      ))}
      <line x1="48" y1="72" x2="154" y2="72" stroke="#fff" strokeWidth="3" opacity="0.4" />
      <ellipse cx="160" cy="100" rx="10" ry="32" fill={c} stroke={s} strokeWidth="2" />
      <ellipse cx="160" cy="100" rx="6" ry="23" fill={DARK} opacity="0.85" />
    </g>
  ),
  fusilli: (c, s) => (
    <g transform="rotate(-35 100 100)">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i} transform={`rotate(28 ${40 + i * 20} 100)`}>
          <ellipse cx={40 + i * 20} cy="100" rx="12" ry="34" fill={i % 2 ? s : c} stroke={s} strokeWidth="2" />
          <path
            d={`M${40 + i * 20} 70 Q ${44 + i * 20} 100 ${40 + i * 20} 130`}
            stroke={i % 2 ? c : s}
            strokeWidth="2.4"
            opacity="0.8"
          />
        </g>
      ))}
    </g>
  ),
  farfalle: (c, s) => (
    <g transform="rotate(-12 100 100)">
      <path d="M100 100 C80 78 58 52 36 60 C24 80 24 120 36 140 C58 148 80 122 100 100Z" fill={c} stroke={s} strokeWidth="2.5" />
      <path d="M100 100 C120 78 142 52 164 60 C176 80 176 120 164 140 C142 148 120 122 100 100Z" fill={c} stroke={s} strokeWidth="2.5" />
      <polyline points="36,62 30,70 36,78 30,86 36,94 30,102 36,110 30,118 36,126 30,134 36,140" stroke={s} strokeWidth="2.5" />
      <polyline points="164,62 170,70 164,78 170,86 164,94 170,102 164,110 170,118 164,126 170,134 164,140" stroke={s} strokeWidth="2.5" />
      {[-24, -10, 10, 24].map((d) => (
        <g key={d} stroke={s} strokeWidth="2" opacity="0.7">
          <path d={`M92 100 Q 64 ${100 + d * 0.6} 42 ${100 + d * 1.4}`} />
          <path d={`M108 100 Q 136 ${100 + d * 0.6} 158 ${100 + d * 1.4}`} />
        </g>
      ))}
      <ellipse cx="100" cy="100" rx="11" ry="20" fill={s} />
      <ellipse cx="100" cy="100" rx="6" ry="14" fill={c} />
    </g>
  ),
  conchiglie: (c, s) => (
    <g>
      <path d="M36 112 C36 60 150 42 166 96 C172 132 122 162 82 152 C56 146 36 132 36 112Z" fill={c} stroke={s} strokeWidth="2.5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${60 + i * 18} ${66 - i * 3} C ${70 + i * 18} ${100} ${66 + i * 16} ${130} ${58 + i * 16} ${150 - i * 2}`}
          stroke={s}
          strokeWidth="2.4"
          opacity="0.7"
        />
      ))}
      <path d="M58 112 C70 84 132 78 150 100 C134 120 92 130 58 112Z" fill={DARK} opacity="0.8" />
      <path d="M62 110 C76 90 128 86 144 100" stroke={c} strokeWidth="3" opacity="0.6" />
    </g>
  ),
  elbow: (c, s) => {
    const d = "M55 150 A90 90 0 0 1 145 60";
    return (
      <g transform="translate(-6 8)">
        <path d={d} stroke={s} strokeWidth="40" strokeLinecap="butt" />
        <path d={d} stroke={c} strokeWidth="36" strokeLinecap="butt" />
        <path d={d} stroke={s} strokeWidth="24" strokeLinecap="butt" opacity="0.55" />
        <path d={d} stroke={c} strokeWidth="21" strokeLinecap="butt" />
        <path d={d} stroke={s} strokeWidth="10" strokeLinecap="butt" opacity="0.5" />
        <path d={d} stroke={c} strokeWidth="7" strokeLinecap="butt" />
        <ellipse cx="55" cy="150" rx="20" ry="6" fill={s} />
        <ellipse cx="145" cy="60" rx="6" ry="20" fill={c} stroke={s} strokeWidth="2" />
        <ellipse cx="145" cy="60" rx="3" ry="11" fill={DARK} opacity="0.85" />
      </g>
    );
  },
  spaghetti: (c, s, bare) => (
    <g>
      {Array.from({ length: 11 }).map((_, i) => (
        <line
          key={i}
          x1={24 + i * 5}
          y1={178 - i * 2}
          x2={162 + i * 3.5}
          y2={24 + i * 5}
          stroke={i % 3 === 0 ? s : c}
          strokeWidth="5.5"
        />
      ))}
      {!bare && (
        <>
          <rect x="84" y="82" width="36" height="22" rx="4" transform="rotate(-45 102 93)" fill="var(--color-mk-blue)" />
          <rect x="84" y="82" width="36" height="6" rx="2" transform="rotate(-45 102 93)" fill="var(--color-mk-yellow)" />
        </>
      )}
    </g>
  ),
  nest: (c, s) => (
    <g>
      <circle cx="100" cy="100" r="70" fill={s} opacity="0.25" />
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 23} 100 100)`}>
          <ellipse cx="100" cy="100" rx="64" ry="38" stroke={s} strokeWidth="13" />
          <ellipse cx="100" cy="100" rx="64" ry="38" stroke={c} strokeWidth="9" />
        </g>
      ))}
      <circle cx="100" cy="100" r="16" fill={DARK} opacity="0.25" />
    </g>
  ),
  vermicelli: (c, s) => (
    <g>
      {[
        [40, 50, 10], [110, 40, -20], [150, 80, 30], [60, 95, -10], [120, 110, 15],
        [30, 140, 40], [90, 150, -30], [150, 150, 0], [80, 60, 60], [130, 170, -15],
        [45, 175, 20], [165, 115, -40], [100, 85, 80], [70, 125, 5],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          d={`M${x - 18} ${y} q 6 -8 12 0 t 12 0 t 12 0`}
          transform={`rotate(${r} ${x} ${y})`}
          stroke={i % 3 === 0 ? s : c}
          strokeWidth="4.5"
        />
      ))}
    </g>
  ),
  noodles: (c, s) => (
    <g>
      {[55, 85, 115, 145].map((y, i) => {
        const d = `M18 ${y} C 55 ${y - 34}, 85 ${y + 34}, 120 ${y} S 170 ${y - 30}, 184 ${y - 6}`;
        return (
          <g key={y} transform={`rotate(${-8 + i * 3} 100 100)`}>
            <path d={d} stroke={s} strokeWidth="19" />
            <path d={d} stroke={c} strokeWidth="15" />
            <path d={d} stroke="#fff" strokeWidth="2" opacity="0.35" transform="translate(0 -3)" />
          </g>
        );
      })}
    </g>
  ),
};
