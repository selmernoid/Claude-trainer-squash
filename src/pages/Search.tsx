import { Link, useSearchParams } from 'react-router-dom';
import { ALL_TOPICS } from '../data/areas';
import { DRILLS } from '../data/drills';
import { GLOSSARY } from '../data/glossary';

export function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  const match = (text: string) => words.length > 0 && words.every((w) => text.toLowerCase().includes(w));

  const topics = ALL_TOPICS.filter(({ area, topic }) =>
    match([area.name, topic.title, topic.summary, ...topic.keyPoints, ...(topic.cues ?? []), ...(topic.mistakes ?? []).flatMap((m) => [m.mistake, m.fix])].join(' ')),
  );
  const drills = DRILLS.filter((d) => match([d.name, d.summary, ...d.steps, d.goal].join(' ')));
  const terms = GLOSSARY.filter((g) => match(g.term + ' ' + g.definition));
  const total = topics.length + drills.length + terms.length;

  return (
    <div style={{ maxWidth: 820 }}>
      <h1>Search</h1>
      <p className="lead">{q ? `${total} result${total === 1 ? '' : 's'} for “${params.get('q')}”` : 'Type in the search box above.'}</p>
      {topics.length > 0 && (
        <section className="section">
          <h2>Topics</h2>
          <div className="stack">
            {topics.map(({ area, topic }) => (
              <Link key={area.id + topic.id} className="card topic-link" to={`/learn/${area.id}/${topic.id}`} style={{ borderLeft: `4px solid ${area.color}` }}>
                <div><h3 style={{ margin: 0 }}>{topic.title}</h3><p className="small muted" style={{ margin: 0 }}>{area.name} · {topic.summary}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {drills.length > 0 && (
        <section className="section">
          <h2>Drills</h2>
          <div className="stack">
            {drills.map((d) => (
              <Link key={d.id} className="card topic-link" to={`/drills?q=${encodeURIComponent(d.name)}`}>
                <div><h3 style={{ margin: 0 }}>{d.name}</h3><p className="small muted" style={{ margin: 0 }}>{d.summary}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {terms.length > 0 && (
        <section className="section">
          <h2>Glossary</h2>
          <dl className="card">
            {terms.map((g) => (
              <div key={g.term} style={{ padding: '6px 0' }}><dt style={{ fontWeight: 700 }}>{g.term}</dt><dd style={{ margin: 0, color: 'var(--muted)' }}>{g.definition}</dd></div>
            ))}
          </dl>
        </section>
      )}
      {q && total === 0 && <div className="empty card">Nothing found. Try a shorter word like “volley”, “serve” or “lunge”.</div>}
    </div>
  );
}
