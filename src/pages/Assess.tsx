import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AREA_BY_ID } from '../data/areas';
import { ASSESSED_AREAS, ASSESSMENT, SCALE } from '../data/assessment';
import { DRILLS } from '../data/drills';
import { LEVEL_LABEL, type AreaId, type Level } from '../data/types';
import { RadarChart } from '../components/RadarChart';
import { DrillCard } from '../components/DrillCard';
import { STORE_KEYS, useStored } from '../lib/storage';
import { count, formatDate } from '../lib/uk';

export interface SavedAssessment {
  date: string;
  answers: Record<string, number>;
}

export function areaScores(answers: Record<string, number>): Record<AreaId, number> {
  const out = {} as Record<AreaId, number>;
  for (const a of ASSESSED_AREAS) {
    const items = ASSESSMENT.filter((i) => i.area === a && answers[i.id]);
    out[a] = items.length ? items.reduce((s, i) => s + answers[i.id], 0) / items.length : 0;
  }
  return out;
}

export function lowestAreas(answers: Record<string, number>, n: number) {
  const s = areaScores(answers);
  return ASSESSED_AREAS.filter((a) => s[a] > 0)
    .sort((a, b) => s[a] - s[b])
    .slice(0, n)
    .map((a) => AREA_BY_ID[a]);
}

export function estimatedLevel(answers: Record<string, number>): Level {
  const vals = Object.values(answers);
  const avg = vals.reduce((s, v) => s + v, 0) / (vals.length || 1);
  return avg < 2.6 ? 'beginner' : avg < 3.8 ? 'intermediate' : 'advanced';
}

export function Assess() {
  const [history, setHistory] = useStored<SavedAssessment[]>(STORE_KEYS.assessments, []);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(history.length > 0);

  const done = ASSESSMENT.every((i) => answers[i.id]);
  const answeredCount = ASSESSMENT.filter((i) => answers[i.id]).length;

  const submit = () => {
    setHistory((h) => [...h, { date: new Date().toISOString(), answers }].slice(-20));
    setShowResult(true);
    window.scrollTo(0, 0);
  };

  if (showResult && history.length) {
    return <Results history={history} onRetake={() => { setAnswers({}); setShowResult(false); }} onClear={() => { setHistory([]); setShowResult(false); }} />;
  }

  return (
    <div style={{ maxWidth: 820 }}>
      <h1>Самооцінка</h1>
      <p className="lead">Будьте чесні: оцініть, як часто кожне твердження справджується в реальних матчах, а не у ваш найкращий день. Це займе близько 3 хвилин.</p>
      <div className="card section">
        {ASSESSMENT.map((item, idx) => (
          <div key={item.id} className="q">
            <div className="small muted" style={{ fontWeight: 700 }}>{idx + 1}. {AREA_BY_ID[item.area].name}</div>
            <p style={{ fontWeight: 600, margin: '4px 0 10px' }}>{item.statement}</p>
            <div className="scale" role="radiogroup" aria-label={item.statement}>
              {SCALE.map((s) => (
                <button
                  key={s.value}
                  role="radio"
                  aria-checked={answers[item.id] === s.value}
                  className="chip"
                  aria-pressed={answers[item.id] === s.value}
                  onClick={() => setAnswers((a) => ({ ...a, [item.id]: s.value }))}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="row section">
        <button className="btn primary big" disabled={!done} onClick={submit}>Показати результати</button>
        <span className="muted small">Відповіли на {answeredCount} з {ASSESSMENT.length}</span>
        {history.length > 0 && <button className="btn ghost" onClick={() => setShowResult(true)}>До останніх результатів</button>}
      </div>
    </div>
  );
}

function Results({ history, onRetake, onClear }: { history: SavedAssessment[]; onRetake: () => void; onClear: () => void }) {
  const last = history[history.length - 1];
  const prev = history.length > 1 ? history[history.length - 2] : undefined;
  const scores = areaScores(last.answers);
  const prevScores = prev ? areaScores(prev.answers) : undefined;
  const level = estimatedLevel(last.answers);
  const focus = lowestAreas(last.answers, 3);

  const drills = useMemo(() => {
    const picked = new Set<string>();
    return focus.map((a) => {
      const list = DRILLS.filter((d) => d.areas.includes(a.id) && !picked.has(d.id))
        .sort((x, y) => Number(y.level === level) - Number(x.level === level))
        .slice(0, 2);
      list.forEach((d) => picked.add(d.id));
      return { area: a, list };
    });
  }, [focus, level]);

  return (
    <div>
      <h1>Ваш профіль навичок</h1>
      <p className="lead">
        Оцінка від {formatDate(last.date)} · орієнтовний рівень: <span className={`badge ${level}`}>{LEVEL_LABEL[level]}</span>
      </p>
      <div className="grid-2 section">
        <div className="card">
          <RadarChart
            labels={ASSESSED_AREAS.map((a) => AREA_BY_ID[a].short)}
            series={[
              ...(prevScores ? [{ label: 'Попередня', values: ASSESSED_AREAS.map((a) => prevScores[a]), color: 'var(--muted)', dashed: true }] : []),
              { label: 'Зараз', values: ASSESSED_AREAS.map((a) => scores[a]), color: '#e0a800' },
            ]}
          />
          {prevScores && <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>Пунктир: попередня оцінка ({formatDate(prev!.date)})</p>}
        </div>
        <div className="card">
          <h2>Бали за напрямами</h2>
          {ASSESSED_AREAS.map((a) => {
            const area = AREA_BY_ID[a];
            const delta = prevScores ? scores[a] - prevScores[a] : 0;
            return (
              <div key={a} style={{ marginBottom: 10, ['--area' as string]: area.color }}>
                <div className="row small" style={{ justifyContent: 'space-between' }}>
                  <Link to={`/learn/${a}`}>{area.name}</Link>
                  <span>
                    {scores[a].toFixed(1)} / 5
                    {prevScores && Math.abs(delta) >= 0.05 && (
                      <span style={{ color: delta > 0 ? 'var(--good)' : 'var(--bad)', marginLeft: 6 }}>{delta > 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}</span>
                    )}
                  </span>
                </div>
                <div className="bar"><span style={{ width: `${(scores[a] / 5) * 100}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="section">
        <h2>На чому зосередитися</h2>
        <p className="muted">Три напрями з найнижчими оцінками й вправи, з яких варто почати.</p>
        <div className="stack">
          {drills.map(({ area, list }) => (
            <div key={area.id} className="card" style={{ borderLeft: `4px solid ${area.color}` }}>
              <div className="section-head">
                <h3 style={{ margin: 0 }}>{area.name} · {scores[area.id].toFixed(1)}</h3>
                <Link className="small" to={`/learn/${area.id}`}>Читати теми →</Link>
              </div>
              <div className="grid">{list.map((d) => <DrillCard key={d.id} drill={d} />)}</div>
              {area.id === 'rules' && <p className="small" style={{ margin: '12px 0 0' }}><Link to="/quiz">Перевірте себе у вікторині з правил →</Link></p>}
            </div>
          ))}
        </div>
      </section>

      <div className="row section">
        <Link className="btn primary" to={`/plan?focus=${focus.map((f) => f.id).join(',')}&level=${level}`}>Скласти тренування на ці напрями</Link>
        <button className="btn" onClick={onRetake}>Пройти знову</button>
        <span className="spacer" />
        <button className="btn ghost danger" onClick={() => { if (confirm('Видалити всі збережені самооцінки з цього браузера?')) onClear(); }}>Видалити історію</button>
      </div>
      <p className="small muted">Проходьте знову кожні 6–8 тижнів, щоб бачити прогрес. У цьому браузері збережено: {count(history.length, ['самооцінка', 'самооцінки', 'самооцінок'])}.</p>
    </div>
  );
}
