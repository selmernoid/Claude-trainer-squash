interface Series {
  values: number[];
  color: string;
  label: string;
  dashed?: boolean;
}

interface Props {
  labels: string[];
  series: Series[];
  max?: number;
}

export function RadarChart({ labels, series, max = 5 }: Props) {
  const size = 320;
  const c = size / 2;
  const r = 110;
  const n = labels.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + Math.cos(a) * r * (v / max), c + Math.sin(a) * r * (v / max)] as const;
  };
  const rings = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <svg viewBox={`-40 -10 ${size + 80} ${size + 20}`} style={{ width: '100%', maxWidth: 420, display: 'block', margin: '0 auto' }} role="img" aria-label="Skill profile radar chart">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={labels.map((_, i) => pt(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
        />
      ))}
      {labels.map((l, i) => {
        const [x, y] = pt(i, max);
        const [lx, ly] = pt(i, max + 0.75);
        const anchor = Math.abs(lx - c) < 10 ? 'middle' : lx > c ? 'start' : 'end';
        return (
          <g key={l}>
            <line x1={c} y1={c} x2={x} y2={y} stroke="var(--border)" />
            <text x={lx} y={ly + 4} textAnchor={anchor} fontSize="12" fill="var(--muted)" fontWeight="600">{l}</text>
          </g>
        );
      })}
      {series.map((s) => (
        <polygon
          key={s.label}
          points={s.values.map((v, i) => pt(i, v).join(',')).join(' ')}
          fill={s.dashed ? 'none' : s.color}
          fillOpacity={s.dashed ? 0 : 0.22}
          stroke={s.color}
          strokeWidth="2"
          strokeDasharray={s.dashed ? '5 4' : undefined}
        />
      ))}
      {series.filter((s) => !s.dashed).map((s) =>
        s.values.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={s.label + i} cx={x} cy={y} r="3.5" fill={s.color} />;
        }),
      )}
    </svg>
  );
}
