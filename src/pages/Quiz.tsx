import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RULES_QUIZ } from '../data/quiz';
import { STORE_KEYS, useStored } from '../lib/storage';
import { count } from '../lib/uk';

function shuffled<T>(a: T[]) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function Quiz() {
  const [order, setOrder] = useState(() => shuffled(RULES_QUIZ));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useStored<number>(STORE_KEYS.quizBest, 0);

  const finished = idx >= order.length;
  const q = order[idx];

  const choose = (i: number) => {
    if (picked != null) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    const nextIdx = idx + 1;
    if (nextIdx >= order.length) setBest((b) => Math.max(b, score));
    setIdx(nextIdx);
    setPicked(null);
  };
  const restart = () => { setOrder(shuffled(RULES_QUIZ)); setIdx(0); setPicked(null); setScore(0); };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Вікторина з правил</h1>
      <p className="lead">Лет, строук чи ноу лет? {count(RULES_QUIZ.length, ['ситуація', 'ситуації', 'ситуацій'])} з реальних матчів. За бажання спершу прочитайте <Link to="/learn/rules/lets-strokes">про лети й строуки</Link> або подивіться <Link to="/videos/set/rules-referee">відео про правила</Link>.</p>

      {finished ? (
        <div className="card section" style={{ textAlign: 'center' }}>
          <h2>Ваш результат: {score} / {order.length}</h2>
          <p className="muted">{score === order.length ? 'Хоч зараз у судді!' : score >= order.length * 0.7 ? 'Міцні знання: перегляньте питання, де помилилися.' : 'Варто ще раз перечитати розділ про правила.'}</p>
          <p className="small muted">Найкращий результат у цьому браузері: {Math.max(best, score)} / {order.length}</p>
          <button className="btn primary" onClick={restart}>Спробувати ще</button>
        </div>
      ) : (
        <div className="card section">
          <div className="row small muted" style={{ justifyContent: 'space-between' }}>
            <span>Питання {idx + 1} з {order.length}</span>
            <span>Рахунок {score}</span>
          </div>
          <div className="bar" style={{ margin: '8px 0 16px' }}><span style={{ width: `${(idx / order.length) * 100}%` }} /></div>
          <p style={{ fontSize: '1.08rem', fontWeight: 600 }}>{q.scenario}</p>
          <div>
            {q.options.map((o, i) => {
              const cls = picked == null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : '';
              return (
                <button key={o} className={`btn option ${cls}`} onClick={() => choose(i)} disabled={picked != null && cls === ''}>
                  {o}
                </button>
              );
            })}
          </div>
          {picked != null && (
            <div className="notice" role="status" style={{ marginTop: 8 }}>
              <strong style={{ color: picked === q.answer ? 'var(--good)' : 'var(--bad)' }}>{picked === q.answer ? 'Правильно.' : 'Не зовсім.'}</strong> {q.explanation}
            </div>
          )}
          {picked != null && (
            <div className="row" style={{ marginTop: 14, justifyContent: 'flex-end' }}>
              <button className="btn primary" onClick={next}>{idx + 1 < order.length ? 'Наступне питання' : 'Результат'}</button>
            </div>
          )}
        </div>
      )}
      <p className="small muted">Спрощено для навчання. Офіційне джерело — правила World Squash Federation.</p>
    </div>
  );
}
