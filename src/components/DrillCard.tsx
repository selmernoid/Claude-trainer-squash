import { Link } from 'react-router-dom';
import { AREA_BY_ID } from '../data/areas';
import { LEVEL_LABEL, type Drill } from '../data/types';
import { videosForDrill } from '../data/videos';

interface Props {
  drill: Drill;
  favorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  open?: boolean;
}

const PLAYERS_SHORT = { solo: 'Самостійно', pairs: 'У парі', group: 'Група' } as const;

export function DrillCard({ drill, favorite, onToggleFavorite, open }: Props) {
  const videos = videosForDrill(drill.id);
  return (
    <article className="card drill-card" id={drill.id}>
      <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <h3 style={{ flex: 1 }}>{drill.name}</h3>
        {onToggleFavorite && (
          <button
            className="fav"
            aria-pressed={favorite}
            aria-label={favorite ? 'Прибрати зі збережених' : 'Зберегти вправу'}
            title={favorite ? 'Збережено' : 'Зберегти'}
            onClick={() => onToggleFavorite(drill.id)}
          >
            {favorite ? '★' : '☆'}
          </button>
        )}
      </div>
      <div className="drill-meta">
        <span className={`badge ${drill.level}`}>{LEVEL_LABEL[drill.level]}</span>
        <span>{drill.players.map((p) => PLAYERS_SHORT[p]).join(' / ')}</span>
        <span>· {drill.minutes} хв</span>
        <span>· {drill.areas.map((a) => AREA_BY_ID[a].short).join(', ')}</span>
      </div>
      <p className="small" style={{ margin: 0 }}>{drill.summary}</p>
      <details open={open}>
        <summary>Як виконувати</summary>
        <ol className="small">
          {drill.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <p className="small" style={{ marginBottom: 4 }}><strong>Мета:</strong> {drill.goal}</p>
        {drill.progression && <p className="small" style={{ margin: 0 }}><strong>Ускладнення:</strong> {drill.progression}</p>}
        {drill.id.startsWith('ghosting-random') && (
          <p className="small" style={{ marginTop: 8 }}><Link to="/ghosting">Відкрити тренажер гостингу →</Link></p>
        )}
        {videos.length > 0 && (
          <div className="small" style={{ marginTop: 8 }}>
            <strong>Відео:</strong>{' '}
            {videos.slice(0, 3).map((v, i) => (
              <span key={v.id}>{i > 0 && ' · '}<Link to={`/videos/${v.id}`}>{v.title}</Link></span>
            ))}
          </div>
        )}
      </details>
    </article>
  );
}
