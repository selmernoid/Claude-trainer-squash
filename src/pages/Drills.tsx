import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AREAS } from '../data/areas';
import { DRILLS } from '../data/drills';
import { LEVELS, type Players } from '../data/types';
import { DrillCard } from '../components/DrillCard';
import { STORE_KEYS, useStored } from '../lib/storage';

const PLAYERS: { id: Players; label: string }[] = [
  { id: 'solo', label: 'Solo' },
  { id: 'pairs', label: 'Pairs' },
  { id: 'group', label: 'Group (3+)' },
];

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
      <h1>Drill library</h1>
      <p className="lead">{DRILLS.length} drills for solo practice, pairs and groups. Star the ones you like to find them quickly.</p>

      <div className="card section stack">
        <input type="search" placeholder="Filter drills…" value={q} onChange={(e) => set('q', e.target.value)} aria-label="Filter drills" />
        <div className="row" role="group" aria-label="Area">
          {AREAS.filter((a) => a.id !== 'gear').map((a) => (
            <button key={a.id} className="chip" aria-pressed={area === a.id} onClick={() => toggle('area', a.id, area)}>{a.name}</button>
          ))}
        </div>
        <div className="row">
          <div className="row" role="group" aria-label="Players">
            {PLAYERS.map((p) => (
              <button key={p.id} className="chip" aria-pressed={players === p.id} onClick={() => toggle('players', p.id, players)}>{p.label}</button>
            ))}
          </div>
          <div className="row" role="group" aria-label="Level">
            {LEVELS.map((l) => (
              <button key={l} className="chip" aria-pressed={level === l} onClick={() => toggle('level', l, level)} style={{ textTransform: 'capitalize' }}>{l}</button>
            ))}
          </div>
          <button className="chip" aria-pressed={saved} onClick={() => set('saved', saved ? '' : '1')}>★ Saved ({favs.length})</button>
          {(area || level || players || saved || q) && (
            <button className="btn ghost small" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
          )}
        </div>
      </div>

      <p className="small muted section" style={{ marginTop: 16 }}>{list.length} drill{list.length === 1 ? '' : 's'}</p>
      {list.length ? (
        <div className="grid">
          {list.map((d) => <DrillCard key={d.id} drill={d} favorite={favs.includes(d.id)} onToggleFavorite={toggleFav} />)}
        </div>
      ) : (
        <div className="empty card">No drills match these filters.</div>
      )}
    </div>
  );
}
