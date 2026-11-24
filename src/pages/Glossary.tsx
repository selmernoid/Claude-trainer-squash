import { useState } from 'react';
import { GLOSSARY } from '../data/glossary';

export function Glossary() {
  const [q, setQ] = useState('');
  const list = GLOSSARY.filter((g) => (g.term + ' ' + g.definition).toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ maxWidth: 820 }}>
      <h1>Glossary</h1>
      <p className="lead">Squash terms in plain English.</p>
      <input type="search" placeholder="Find a term…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find a term" style={{ margin: '12px 0' }} />
      <dl className="card">
        {list.map((g) => (
          <div key={g.term} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <dt style={{ fontWeight: 700 }}>{g.term}</dt>
            <dd style={{ margin: '2px 0 0', color: 'var(--muted)' }}>{g.definition}</dd>
          </div>
        ))}
        {!list.length && <div className="empty">No matching terms.</div>}
      </dl>
    </div>
  );
}
