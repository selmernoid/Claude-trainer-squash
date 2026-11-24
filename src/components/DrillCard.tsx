import { Link } from 'react-router-dom';
import { AREA_BY_ID } from '../data/areas';
import type { Drill } from '../data/types';

interface Props {
  drill: Drill;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  open?: boolean;
}

const PLAYERS_LABEL = { solo: 'Solo', pairs: 'Pairs', group: 'Group' } as const;

export function DrillCard({ drill, favorite, onToggleFavorite, open }: Props) {
  return (
    <article className="card drill-card" id={drill.id}>
      <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <h3 style={{ flex: 1 }}>{drill.name}</h3>
        {onToggleFavorite && (
          <button
            className="fav"
            aria-pressed={favorite}
            aria-label={favorite ? 'Remove from saved drills' : 'Save drill'}
            title={favorite ? 'Saved' : 'Save'}
            onClick={() => onToggleFavorite(drill.id)}
          >
            {favorite ? '★' : '☆'}
          </button>
        )}
      </div>
      <div className="drill-meta">
        <span className={`badge ${drill.level}`}>{drill.level}</span>
        <span>{drill.players.map((p) => PLAYERS_LABEL[p]).join(' / ')}</span>
        <span>· {drill.minutes} min</span>
        <span>· {drill.areas.map((a) => AREA_BY_ID[a].short).join(', ')}</span>
      </div>
      <p className="small" style={{ margin: 0 }}>{drill.summary}</p>
      <details open={open}>
        <summary>How to do it</summary>
        <ol className="small">
          {drill.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <p className="small" style={{ marginBottom: 4 }}><strong>Goal:</strong> {drill.goal}</p>
        {drill.progression && <p className="small" style={{ margin: 0 }}><strong>Make it harder:</strong> {drill.progression}</p>}
        {drill.id.startsWith('ghosting-random') && (
          <p className="small" style={{ marginTop: 8 }}><Link to="/ghosting">Open the Ghosting trainer →</Link></p>
        )}
      </details>
    </article>
  );
}
