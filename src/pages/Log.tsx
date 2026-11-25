import { FormEvent, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AREAS, AREA_BY_ID } from '../data/areas';
import type { AreaId } from '../data/types';
import { clearAll, exportAll, importAll, STORE_KEYS, useStored } from '../lib/storage';

type EntryType = 'solo' | 'drills' | 'match' | 'fitness' | 'lesson';

interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  type: EntryType;
  minutes: number;
  focus: AreaId[];
  feel: number;
  result?: 'won' | 'lost';
  score?: string;
  notes?: string;
}

const TYPES: { id: EntryType; label: string }[] = [
  { id: 'solo', label: 'Самостійне тренування' },
  { id: 'drills', label: 'Вправи з партнером' },
  { id: 'match', label: 'Матч' },
  { id: 'fitness', label: 'Фізпідготовка' },
  { id: 'lesson', label: 'Заняття з тренером' },
];
const TYPE_LABEL = Object.fromEntries(TYPES.map((t) => [t.id, t.label])) as Record<EntryType, string>;
const FEEL = ['😣', '😕', '😐', '🙂', '🔥'];

const today = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
const daysAgo = (date: string) => Math.floor((Date.parse(today()) - Date.parse(date)) / 86_400_000);

interface Draft { minutes?: number; type?: EntryType; focus?: string; notes?: string }

export function Log() {
  const [entries, setEntries] = useStored<Entry[]>(STORE_KEYS.log, []);
  const draft = (useLocation().state as { draft?: Draft } | null)?.draft;
  const blank = (): Omit<Entry, 'id'> => ({
    date: today(),
    type: draft?.type ?? 'solo',
    minutes: draft?.minutes ?? 45,
    focus: (draft?.focus?.split(',').filter((f) => f in AREA_BY_ID) as AreaId[]) ?? [],
    feel: 3,
    notes: draft?.notes ?? '',
  });
  const [form, setForm] = useState(blank);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const add = (e: FormEvent) => {
    e.preventDefault();
    const entry: Entry = { ...form, id: crypto.randomUUID?.() ?? String(Date.now()) };
    if (entry.type !== 'match') { delete entry.result; delete entry.score; }
    setEntries((list) => [entry, ...list].sort((a, b) => b.date.localeCompare(a.date)));
    setForm({ ...blank(), notes: '' });
    setMsg('Збережено.');
    setTimeout(() => setMsg(''), 2000);
  };

  const stats = useMemo(() => {
    const last7 = entries.filter((e) => daysAgo(e.date) < 7);
    const last28 = entries.filter((e) => daysAgo(e.date) < 28);
    const matches = entries.filter((e) => e.type === 'match' && e.result);
    const won = matches.filter((m) => m.result === 'won').length;
    const byArea = Object.fromEntries(AREAS.map((a) => [a.id, 0])) as Record<AreaId, number>;
    for (const e of last28) for (const f of e.focus) byArea[f] += e.minutes / (e.focus.length || 1);
    const weeks = Array.from({ length: 8 }, (_, i) =>
      entries.filter((e) => Math.floor(daysAgo(e.date) / 7) === 7 - i).reduce((s, e) => s + e.minutes, 0),
    );
    return {
      sessions7: last7.length,
      minutes7: last7.reduce((s, e) => s + e.minutes, 0),
      minutes28: last28.reduce((s, e) => s + e.minutes, 0),
      won,
      lost: matches.length - won,
      byArea,
      weeks,
    };
  }, [entries]);

  const maxWeek = Math.max(60, ...stats.weeks);
  const maxArea = Math.max(1, ...Object.values(stats.byArea));

  const download = () => {
    const blob = new Blob([exportAll()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `squash-trainer-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const upload = async (file: File) => {
    if (importAll(await file.text())) window.location.reload();
    else alert('Цей файл не є резервною копією Сквош-тренера.');
  };

  return (
    <div>
      <h1>Журнал тренувань</h1>
      <p className="lead">Записуйте, що тренуєте і як минають матчі. Дані зберігаються лише в цьому браузері: щоб перенести їх на інший пристрій, експортуйте резервну копію.</p>

      <div className="grid section">
        <div className="card stat"><span className="num">{stats.sessions7}</span><span className="lbl">занять за останні 7 днів</span></div>
        <div className="card stat"><span className="num">{stats.minutes7}</span><span className="lbl">хвилин за останні 7 днів</span></div>
        <div className="card stat"><span className="num">{(stats.minutes28 / 60).toFixed(1).replace('.', ',')} год</span><span className="lbl">за останні 28 днів</span></div>
        <div className="card stat"><span className="num">{stats.won}–{stats.lost}</span><span className="lbl">матчі (перемоги–поразки)</span></div>
      </div>

      <div className="grid-2 section">
        <form className="card stack" onSubmit={add}>
          <h2 style={{ margin: 0 }}>Новий запис</h2>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            <label className="field">Дата
              <input type="date" value={form.date} max={today()} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </label>
            <label className="field">Хвилини
              <input type="number" min={5} max={600} step={5} value={form.minutes} onChange={(e) => setForm({ ...form, minutes: +e.target.value })} required />
            </label>
          </div>
          <label className="field">Тип
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EntryType })}>
              {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </label>
          {form.type === 'match' && (
            <div className="row">
              <button type="button" className="chip" aria-pressed={form.result === 'won'} onClick={() => setForm({ ...form, result: 'won' })}>Перемога</button>
              <button type="button" className="chip" aria-pressed={form.result === 'lost'} onClick={() => setForm({ ...form, result: 'lost' })}>Поразка</button>
              <input type="text" placeholder="Рахунок, напр. 3:1" value={form.score ?? ''} onChange={(e) => setForm({ ...form, score: e.target.value })} style={{ maxWidth: 160 }} />
            </div>
          )}
          <div>
            <div className="small muted" style={{ fontWeight: 600, marginBottom: 6 }}>Фокус</div>
            <div className="row">
              {AREAS.filter((a) => a.id !== 'gear').map((a) => (
                <button type="button" key={a.id} className="chip" aria-pressed={form.focus.includes(a.id)}
                  onClick={() => setForm({ ...form, focus: form.focus.includes(a.id) ? form.focus.filter((f) => f !== a.id) : [...form.focus, a.id] })}>
                  {a.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="small muted" style={{ fontWeight: 600, marginBottom: 6 }}>Як почувалися?</div>
            <div className="row">
              {FEEL.map((f, i) => (
                <button type="button" key={f} className="chip" aria-pressed={form.feel === i + 1} aria-label={`Самопочуття ${i + 1} з 5`} onClick={() => setForm({ ...form, feel: i + 1 })}>{f}</button>
              ))}
            </div>
          </div>
          <label className="field">Нотатки: що спрацювало, що тренувати далі
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          <div className="row">
            <button className="btn primary" type="submit">Зберегти запис</button>
            <span className="small muted" role="status">{msg}</span>
          </div>
        </form>

        <div className="stack">
          <div className="card">
            <h3>Хвилин на тиждень</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }} role="img" aria-label={`Хвилин на тиждень за останні 8 тижнів: ${stats.weeks.join(', ')}`}>
              {stats.weeks.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  <span className="small muted" style={{ fontSize: '0.7rem' }}>{m || ''}</span>
                  <div style={{ width: '100%', height: `${(m / maxWeek) * 100}%`, minHeight: m ? 3 : 0, background: i === 7 ? 'var(--accent)' : 'var(--link)', borderRadius: '4px 4px 0 0', opacity: i === 7 ? 1 : 0.6 }} />
                </div>
              ))}
            </div>
            <div className="row small muted" style={{ justifyContent: 'space-between', marginTop: 4 }}><span>8 тижнів тому</span><span>Цей тиждень</span></div>
          </div>
          <div className="card">
            <h3>Фокус за останні 28 днів</h3>
            {Object.values(stats.byArea).some(Boolean) ? (
              AREAS.filter((a) => stats.byArea[a.id] > 0).map((a) => (
                <div key={a.id} style={{ marginBottom: 8, ['--area' as string]: a.color }}>
                  <div className="row small" style={{ justifyContent: 'space-between' }}><span>{a.name}</span><span>{Math.round(stats.byArea[a.id])} хв</span></div>
                  <div className="bar"><span style={{ width: `${(stats.byArea[a.id] / maxArea) * 100}%` }} /></div>
                </div>
              ))
            ) : <p className="small muted" style={{ margin: 0 }}>Позначайте записи напрямом, щоб бачити тут свій баланс.</p>}
          </div>
        </div>
      </div>

      <section className="section card">
        <h2>Історія</h2>
        {entries.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Дата</th><th>Тип</th><th>Хв</th><th>Фокус</th><th>Самопочуття</th><th>Нотатки</th><th /></tr></thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td>{TYPE_LABEL[e.type]}{e.result && <> · <strong style={{ color: e.result === 'won' ? 'var(--good)' : 'var(--bad)' }}>{e.result === 'won' ? 'перемога' : 'поразка'}</strong> {e.score}</>}</td>
                    <td>{e.minutes}</td>
                    <td className="small">{e.focus.map((f) => AREA_BY_ID[f]?.short).join(', ')}</td>
                    <td>{FEEL[e.feel - 1]}</td>
                    <td className="small" style={{ whiteSpace: 'pre-line', maxWidth: 320 }}>{e.notes}</td>
                    <td><button className="btn ghost small danger" aria-label="Видалити запис" onClick={() => { if (confirm('Видалити цей запис?')) setEntries((l) => l.filter((x) => x.id !== e.id)); }}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty">Записів ще немає. Ваше перше тренування з'явиться тут.</div>}
      </section>

      <section className="section card">
        <h2>Ваші дані</h2>
        <p className="small muted">Сквош-тренер не має акаунтів і нічого не надсилає на сервер. Ваш журнал, самооцінки, збережені вправи й налаштування зберігаються в цьому браузері.</p>
        <div className="row">
          <button className="btn" onClick={download}>Експорт резервної копії (.json)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}>Імпорт резервної копії</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <span className="spacer" />
          <button className="btn ghost danger" onClick={() => { if (confirm('Видалити ВСІ дані Сквош-тренера з цього браузера?')) { clearAll(); window.location.reload(); } }}>Видалити всі дані</button>
        </div>
      </section>
    </div>
  );
}
