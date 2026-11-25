import { Link, useSearchParams } from 'react-router-dom';
import { ALL_TOPICS } from '../data/areas';
import { DRILLS } from '../data/drills';
import { GLOSSARY } from '../data/glossary';
import { KIND_LABEL, VIDEOS } from '../data/videos';
import { count } from '../lib/uk';

export function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  const match = (text: string) => words.length > 0 && words.every((w) => text.toLowerCase().includes(w));

  const topics = ALL_TOPICS.filter(({ area, topic }) =>
    match([area.name, topic.title, topic.summary, ...topic.keyPoints, ...(topic.cues ?? []), ...(topic.mistakes ?? []).flatMap((m) => [m.mistake, m.fix])].join(' ')),
  );
  const drills = DRILLS.filter((d) => match([d.name, d.summary, ...d.steps, d.goal].join(' ')));
  const videos = VIDEOS.filter((v) => match([v.title, v.note, v.originalTitle ?? '', v.channel ?? ''].join(' ')));
  const terms = GLOSSARY.filter((g) => match(g.term + ' ' + g.definition));
  const total = topics.length + drills.length + videos.length + terms.length;

  return (
    <div style={{ maxWidth: 820 }}>
      <h1>Пошук</h1>
      <p className="lead">{q ? `${count(total, ['результат', 'результати', 'результатів'])} за запитом «${params.get('q')}»` : 'Введіть запит у поле пошуку вгорі.'}</p>
      {topics.length > 0 && (
        <section className="section">
          <h2>Теми</h2>
          <div className="stack">
            {topics.map(({ area, topic }) => (
              <Link key={area.id + topic.id} className="card topic-link" to={`/learn/${area.id}/${topic.id}`} style={{ borderLeft: `4px solid ${area.color}` }}>
                <div><h3 style={{ margin: 0 }}>{topic.title}</h3><p className="small muted" style={{ margin: 0 }}>{area.name} · {topic.summary}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {videos.length > 0 && (
        <section className="section">
          <h2>Відео</h2>
          <div className="stack">
            {videos.map((v) => (
              <Link key={v.id} className="card topic-link" to={`/videos/${v.id}`}>
                <div><h3 style={{ margin: 0 }}>{v.title}</h3><p className="small muted" style={{ margin: 0 }}>{KIND_LABEL[v.kind]} · {v.note}</p></div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {drills.length > 0 && (
        <section className="section">
          <h2>Вправи</h2>
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
          <h2>Словник</h2>
          <dl className="card">
            {terms.map((g) => (
              <div key={g.term} style={{ padding: '6px 0' }}><dt style={{ fontWeight: 700 }}>{g.term}</dt><dd style={{ margin: 0, color: 'var(--muted)' }}>{g.definition}</dd></div>
            ))}
          </dl>
        </section>
      )}
      {q && total === 0 && <div className="empty card">Нічого не знайдено. Спробуйте коротше слово, наприклад «воллей», «подача» чи «випад».</div>}
    </div>
  );
}
