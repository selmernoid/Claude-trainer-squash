import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AREAS } from '../data/areas';
import { DRILLS } from '../data/drills';
import { LEVELS, LEVEL_LABEL, PLAYERS_LABEL, type Players } from '../data/types';
import { DrillCard } from '../components/DrillCard';
import { STORE_KEYS, useStored } from '../lib/storage';
import { count } from '../lib/uk';

const PLAYERS: Players[] = ['solo', 'pairs', 'group'];
const DRILL_FORMS: [string, string, string] = ['вправа', 'вправи', 'вправ'];

export function Drills() {
  const [params, setParams] = useSearchParams();
  const [favs, setFavs] = useStored<string[]>(STORE_KEYS.favorites, []);
  const area = params.get('area') ?? '';
  const level = params.get('level') ?? '';
  const players = params.get('players') ?? '';
  const saved = params.get('saved') === '1';
  const q = params.get('q') ?? '';

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const toggle = (k: string, v: string, current: string) => set(k, current === v ? '' : v);
  const toggleFav = (id: string) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const list = useMemo(() => {
    const needle = q.toLowerCase();
    return DRILLS.filter(
      (d) =>
        (!area || d.areas.includes(area as never)) &&
        (!level || d.level === level) &&
        (!players || d.players.includes(players as Players)) &&
        (!saved || favs.includes(d.id)) &&
        (!needle || (d.name + ' ' + d.summary).toLowerCase().includes(needle)),
    );
  }, [area, level, players, saved, q, favs]);

  return (
    <div>
      <h1>Бібліотека вправ</h1>
      <p className="lead">{count(DRILLS.length, DRILL_FORMS)} для занять самостійно, у парі й групою. Позначайте зірочкою ті, що сподобалися, щоб швидко їх знаходити.</p>

      <div className="card section stack">
        <input type="search" placeholder="Знайти вправу…" value={q} onChange={(e) => set('q', e.target.value)} aria-label="Знайти вправу" />
        <div className="row" role="group" aria-label="Напрям">
          {AREAS.filter((a) => a.id !== 'gear').map((a) => (
            <button key={a.id} className="chip" aria-pressed={area === a.id} onClick={() => toggle('area', a.id, area)}>{a.name}</button>
          ))}
        </div>
        <div className="row">
          <div className="row" role="group" aria-label="Гравці">
            {PLAYERS.map((p) => (
              <button key={p} className="chip" aria-pressed={players === p} onClick={() => toggle('players', p, players)}>{PLAYERS_LABEL[p]}</button>
            ))}
          </div>
          <div className="row" role="group" aria-label="Рівень">
            {LEVELS.map((l) => (
              <button key={l} className="chip" aria-pressed={level === l} onClick={() => toggle('level', l, level)}>{LEVEL_LABEL[l]}</button>
            ))}
          </div>
          <button className="chip" aria-pressed={saved} onClick={() => set('saved', saved ? '' : '1')}>★ Збережені ({favs.length})</button>
          {(area || level || players || saved || q) && (
            <button className="btn ghost small" onClick={() => setParams({}, { replace: true })}>Скинути фільтри</button>
          )}
        </div>
      </div>

      <p className="small muted section" style={{ marginTop: 16 }}>{count(list.length, DRILL_FORMS)}</p>
      {list.length ? (
        <div className="grid">
          {list.map((d) => <DrillCard key={d.id} drill={d} favorite={favs.includes(d.id)} onToggleFavorite={toggleFav} />)}
        </div>
      ) : (
        <div className="empty card">Немає вправ із такими фільтрами.</div>
      )}
    </div>
  );
}
