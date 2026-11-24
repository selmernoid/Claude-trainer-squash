import { Link, useParams } from 'react-router-dom';
import { AREAS, AREA_BY_ID, findTopic } from '../data/areas';
import { DRILL_BY_ID, DRILLS } from '../data/drills';
import type { AreaId, Level } from '../data/types';
import { DrillCard } from '../components/DrillCard';
import { NotFound } from './NotFound';

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`badge ${level}`}>{level}</span>;
}

export function LearnIndex() {
  return (
    <div>
      <h1>Learn</h1>
      <p className="lead">Pick an area. Each topic has key points, common mistakes with fixes, coaching cues, and drills to practise it.</p>
      <div className="stack section">
        {AREAS.map((a) => (
          <section key={a.id} className="card" style={{ borderLeft: `4px solid ${a.color}` }}>
            <div className="section-head">
              <h2><Link to={`/learn/${a.id}`} style={{ color: 'inherit' }}>{a.name}</Link></h2>
              <span className="small muted">{a.tagline}</span>
            </div>
            <div className="row">
              {a.topics.map((t) => (
                <Link key={t.id} className="chip" to={`/learn/${a.id}/${t.id}`}>{t.title}</Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function AreaPage() {
  const { areaId } = useParams();
  const area = AREA_BY_ID[areaId as AreaId];
  if (!area) return <NotFound />;
  const drills = DRILLS.filter((d) => d.areas.includes(area.id));
  return (
    <div style={{ ['--area' as string]: area.color }}>
      <div className="breadcrumbs"><Link to="/learn">Learn</Link> / {area.name}</div>
      <h1>{area.name}</h1>
      <p className="lead">{area.intro}</p>
      <div className="stack section">
        {area.topics.map((t) => (
          <Link key={t.id} to={`/learn/${area.id}/${t.id}`} className="card topic-link" style={{ borderLeft: `4px solid ${area.color}` }}>
            <div style={{ flex: 1 }}>
              <div className="row" style={{ marginBottom: 4 }}>
                <h3 style={{ margin: 0 }}>{t.title}</h3>
                <LevelBadge level={t.level} />
              </div>
              <p className="muted small" style={{ margin: 0 }}>{t.summary}</p>
            </div>
            <span aria-hidden className="muted">→</span>
          </Link>
        ))}
      </div>
      {drills.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Drills for {area.name.toLowerCase()}</h2>
            <Link className="small" to={`/drills?area=${area.id}`}>Filter in library →</Link>
          </div>
          <div className="grid">
            {drills.map((d) => <DrillCard key={d.id} drill={d} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export function TopicPage() {
  const { areaId = '', topicId = '' } = useParams();
  const found = findTopic(areaId, topicId);
  if (!found) return <NotFound />;
  const { area, topic } = found;
  const idx = area.topics.indexOf(topic);
  const prev = area.topics[idx - 1];
  const next = area.topics[idx + 1];
  const drills = (topic.drillIds ?? []).map((id) => DRILL_BY_ID[id]).filter(Boolean);

  return (
    <div style={{ ['--area' as string]: area.color, maxWidth: 820 }}>
      <div className="breadcrumbs">
        <Link to="/learn">Learn</Link> / <Link to={`/learn/${area.id}`}>{area.name}</Link> / {topic.title}
      </div>
      <div className="row" style={{ marginBottom: 6 }}>
        <h1 style={{ margin: 0 }}>{topic.title}</h1>
        <LevelBadge level={topic.level} />
      </div>
      <p className="lead">{topic.summary}</p>

      <section className="card section">
        <h2>Key points</h2>
        <ul className="keypoints" style={{ marginBottom: 0 }}>
          {topic.keyPoints.map((k) => <li key={k}>{k}</li>)}
        </ul>
      </section>

      {topic.mistakes && topic.mistakes.length > 0 && (
        <section className="card">
          <h2>Common mistakes</h2>
          {topic.mistakes.map((m) => (
            <div key={m.mistake} className="mistake">
              <div><strong>{m.mistake}</strong></div>
              <div className="fix"><strong>Fix:</strong> {m.fix}</div>
            </div>
          ))}
        </section>
      )}

      {topic.cues && topic.cues.length > 0 && (
        <section className="card">
          <h2>Coaching cues</h2>
          <p className="small muted">Short phrases to say to yourself on court.</p>
          <div className="cues">{topic.cues.map((c) => <span key={c} className="cue">{c}</span>)}</div>
        </section>
      )}

      {drills.length > 0 && (
        <section className="section">
          <h2>Practise it</h2>
          <div className="grid">{drills.map((d) => <DrillCard key={d.id} drill={d} />)}</div>
        </section>
      )}

      <nav className="row section" aria-label="Topic navigation">
        {prev && <Link className="btn" to={`/learn/${area.id}/${prev.id}`}>← {prev.title}</Link>}
        <span className="spacer" />
        {next && <Link className="btn" to={`/learn/${area.id}/${next.id}`}>{next.title} →</Link>}
      </nav>
    </div>
  );
}
