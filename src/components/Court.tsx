export type CourtSpot = 'FL' | 'FR' | 'ML' | 'MR' | 'BL' | 'BR';

export const SPOTS: Record<CourtSpot, { x: number; y: number; label: string; speech: string }> = {
  FL: { x: 85, y: 110, label: 'Front left', speech: 'front left' },
  FR: { x: 555, y: 110, label: 'Front right', speech: 'front right' },
  ML: { x: 70, y: 470, label: 'Volley left', speech: 'volley left' },
  MR: { x: 570, y: 470, label: 'Volley right', speech: 'volley right' },
  BL: { x: 95, y: 880, label: 'Back left', speech: 'back left' },
  BR: { x: 545, y: 880, label: 'Back right', speech: 'back right' },
};

export const T_POS = { x: 320, y: 580 };

interface Props {
  target?: CourtSpot | null;
  enabled?: CourtSpot[];
  className?: string;
  decorative?: boolean;
}

// Top-down court, front wall at the top. Units are centimetres (6.4 m × 9.75 m).
export function Court({ target, enabled, className, decorative }: Props) {
  const t = target ? SPOTS[target] : null;
  return (
    <svg
      viewBox="-20 -20 680 1015"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : t ? `Court diagram, target: ${t.label}` : 'Squash court diagram'}
    >
      {decorative ? (
        <rect x="0" y="0" width="640" height="975" fill="none" stroke="#fff" strokeWidth="8" />
      ) : (
        <>
          <rect x="-20" y="-20" width="680" height="1015" rx="18" fill="var(--court-wall)" />
          <rect x="0" y="0" width="640" height="975" fill="var(--court-floor)" />
        </>
      )}
      <g stroke={decorative ? '#fff' : 'var(--court-line)'} strokeWidth={decorative ? 8 : 5} fill="none">
        <line x1="0" y1="549" x2="640" y2="549" />
        <line x1="320" y1="549" x2="320" y2="975" />
        <rect x="0" y="549" width="160" height="160" />
        <rect x="480" y="549" width="160" height="160" />
      </g>
      {!decorative && <rect x="0" y="0" width="640" height="10" fill="var(--court-line)" opacity="0.6" />}
      {!decorative && (
        <>
          {(Object.keys(SPOTS) as CourtSpot[]).map((k) => {
            const s = SPOTS[k];
            const on = !enabled || enabled.includes(k);
            return <circle key={k} cx={s.x} cy={s.y} r="34" fill="var(--brand)" opacity={on ? 0.18 : 0.05} />;
          })}
          <circle cx={T_POS.x} cy={T_POS.y} r="22" fill="var(--brand)" opacity="0.5" />
          <text x={T_POS.x} y={T_POS.y + 9} textAnchor="middle" fontSize="26" fontWeight="800" fill="#fff">T</text>
          {t && (
            <>
              <line x1={T_POS.x} y1={T_POS.y} x2={t.x} y2={t.y} stroke="var(--brand)" strokeWidth="6" strokeDasharray="14 12" opacity="0.6" />
              <circle key={target} className="target-pulse" cx={t.x} cy={t.y} r="58" fill="var(--accent)" opacity="0.5" />
              <circle cx={t.x} cy={t.y} r="38" fill="var(--accent)" stroke="var(--brand)" strokeWidth="6" />
            </>
          )}
          <text x="320" y="40" textAnchor="middle" fontSize="24" fill="var(--court-line)" fontWeight="700" opacity="0.9">FRONT WALL</text>
        </>
      )}
    </svg>
  );
}
