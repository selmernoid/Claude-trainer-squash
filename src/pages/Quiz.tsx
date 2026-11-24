import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RULES_QUIZ } from '../data/quiz';
import { STORE_KEYS, useStored } from '../lib/storage';

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
      <h1>Rules quiz</h1>
      <p className="lead">Let, stroke or no let? {RULES_QUIZ.length} real-match scenarios. Read the <Link to="/learn/rules/lets-strokes">lets & strokes guide</Link> first if you like.</p>

      {finished ? (
        <div className="card section" style={{ textAlign: 'center' }}>
          <h2>You scored {score} / {order.length}</h2>
          <p className="muted">{score === order.length ? 'Referee material!' : score >= order.length * 0.7 ? 'Solid knowledge — review the ones you missed.' : 'Worth another read of the rules section.'}</p>
          <p className="small muted">Best score in this browser: {Math.max(best, score)} / {order.length}</p>
          <button className="btn primary" onClick={restart}>Try again</button>
        </div>
      ) : (
        <div className="card section">
          <div className="row small muted" style={{ justifyContent: 'space-between' }}>
            <span>Question {idx + 1} of {order.length}</span>
            <span>Score {score}</span>
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
              <strong style={{ color: picked === q.answer ? 'var(--good)' : 'var(--bad)' }}>{picked === q.answer ? 'Correct.' : 'Not quite.'}</strong> {q.explanation}
            </div>
          )}
          {picked != null && (
            <div className="row" style={{ marginTop: 14, justifyContent: 'flex-end' }}>
              <button className="btn primary" onClick={next}>{idx + 1 < order.length ? 'Next question' : 'See result'}</button>
            </div>
          )}
        </div>
      )}
      <p className="small muted">Simplified for learning. The World Squash Federation rules are the official reference.</p>
    </div>
  );
}
