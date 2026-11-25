import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AREAS, AREA_BY_ID } from '../data/areas';
import { LEVELS, LEVEL_LABEL, PLAYERS_LABEL, type AreaId, type Level, type Players } from '../data/types';
import { buildSession } from '../lib/session';
import { readStore, STORE_KEYS } from '../lib/storage';
import { estimatedLevel, lowestAreas, type SavedAssessment } from './Assess';

const DURATIONS = [30, 45, 60, 90];
const FOCUSABLE = AREAS.filter((a) => a.id !== 'gear' && a.id !== 'rules');

export function Plan() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const last = readStore<SavedAssessment[]>(STORE_KEYS.assessments, []).at(-1);

  const initialFocus = (params.get('focus')?.split(',').filter((f) => f in AREA_BY_ID) as AreaId[] | undefined)
    ?? (last ? lowestAreas(last.answers, 2).map((a) => a.id) : ['technique']);
  const initialLevel = (params.get('level') as Level) || (last ? estimatedLevel(last.answers) : 'beginner');

  const [minutes, setMinutes] = useState(45);
  const [players, setPlayers] = useState<Players>('solo');
  const [level, setLevel] = useState<Level>(LEVELS.includes(initialLevel) ? initialLevel : 'beginner');
  const [focus, setFocus] = useState<AreaId[]>(initialFocus);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));

  const blocks = useMemo(() => buildSession({ minutes, players, level, focus, seed }), [minutes, players, level, focus, seed]);
  const total = blocks.reduce((s, b) => s + b.minutes, 0);

  const toggleFocus = (id: AreaId) => setFocus((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const logIt = () => {
    const draft = {
      minutes: total,
      type: players === 'solo' ? 'solo' : 'drills',
      focus: focus.join(','),
      notes: blocks.map((b) => `${b.minutes}′ ${b.drill.name}`).join('\n'),
    };
    navigate('/log', { state: { draft } });
  };

  return (
    <div>
      <h1>Конструктор тренування</h1>
      <p className="lead">Скажіть, скільки маєте часу і з ким граєте. Ви отримаєте структуроване заняття: розминка, основні вправи, гра на завершення й заминка.</p>

      <div className="card section stack no-print">
        <div className="row">
          <strong style={{ minWidth: 90 }}>Час</strong>
          {DURATIONS.map((d) => (
            <button key={d} className="chip" aria-pressed={minutes === d} onClick={() => setMinutes(d)}>{d} хв</button>
          ))}
        </div>
        <div className="row">
          <strong style={{ minWidth: 90 }}>Гравці</strong>
          {(['solo', 'pairs', 'group'] as Players[]).map((p) => (
            <button key={p} className="chip" aria-pressed={players === p} onClick={() => setPlayers(p)}>{PLAYERS_LABEL[p]}</button>
          ))}
        </div>
        <div className="row">
          <strong style={{ minWidth: 90 }}>Рівень</strong>
          {LEVELS.map((l) => (
            <button key={l} className="chip" aria-pressed={level === l} onClick={() => setLevel(l)}>{LEVEL_LABEL[l]}</button>
          ))}
        </div>
        <div className="row">
          <strong style={{ minWidth: 90 }}>Фокус</strong>
          {FOCUSABLE.map((a) => (
            <button key={a.id} className="chip" aria-pressed={focus.includes(a.id)} onClick={() => toggleFocus(a.id)}>{a.name}</button>
          ))}
        </div>
        {last && !params.get('focus') && <p className="small muted" style={{ margin: 0 }}>Фокус і рівень заповнено за вашою <Link to="/assess">самооцінкою</Link>.</p>}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>Ваше тренування: {total} хв, {PLAYERS_LABEL[players].toLowerCase()}</h2>
          <div className="row no-print">
            <button className="btn" onClick={() => setSeed((s) => s + 1)}>↻ Інший варіант</button>
            <button className="btn" onClick={() => window.print()}>Друк</button>
            <button className="btn primary" onClick={logIt}>Записати в журнал</button>
          </div>
        </div>
        <ol className="stack" style={{ listStyle: 'none', padding: 0 }}>
          {blocks.map((b, i) => (
            <li key={b.drill.id + i} className="card" style={{ borderLeft: `4px solid ${AREA_BY_ID[b.drill.areas[0]].color}` }}>
              <div className="row" style={{ alignItems: 'baseline' }}>
                <span className="badge">{b.label}</span>
                <h3 style={{ margin: 0, flex: 1 }}>{b.drill.name}</h3>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{b.minutes} хв</strong>
              </div>
              <p className="small" style={{ margin: '6px 0 0' }}>{b.drill.summary}</p>
              {b.drill.steps.length > 0 && (
                <details>
                  <summary className="small" style={{ cursor: 'pointer', color: 'var(--link)', fontWeight: 600, marginTop: 6 }}>Кроки</summary>
                  <ol className="small" style={{ marginTop: 8 }}>{b.drill.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                  <p className="small" style={{ margin: 0 }}><strong>Мета:</strong> {b.drill.goal}</p>
                </details>
              )}
              {b.drill.id === 'ghosting-random' && <Link className="small no-print" to="/ghosting">Відкрити тренажер гостингу →</Link>}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
