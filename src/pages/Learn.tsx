import { Link, useParams } from 'react-router-dom';
import { AREAS, AREA_BY_ID, findTopic } from '../data/areas';
import { DRILL_BY_ID, DRILLS } from '../data/drills';
import { LEVEL_LABEL, type AreaId, type Level } from '../data/types';
import { videosForArea, videosForTopic } from '../data/videos';
import { DrillCard } from '../components/DrillCard';
import { SubtitlesTip, VideoGrid } from '../components/Video';
import { NotFound } from './NotFound';

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`badge ${level}`}>{LEVEL_LABEL[level]}</span>;
}

export function LearnIndex() {
  return (
    <div>
      <h1>Навчання</h1>
      <p className="lead">Оберіть напрям. Кожна тема містить ключові моменти, типові помилки з виправленнями, підказки на корт, вправи й відео. Незнайомий термін? Загляньте в <Link to="/glossary">словник</Link>.</p>
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
  const videos = videosForArea(area.id);
  return (
    <div style={{ ['--area' as string]: area.color }}>
      <div className="breadcrumbs"><Link to="/learn">Навчання</Link> / {area.name}</div>
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
            <h2>Вправи: {area.name.toLowerCase()}</h2>
            <Link className="small" to={`/drills?area=${area.id}`}>Відкрити в бібліотеці →</Link>
          </div>
          <div className="grid">
            {drills.map((d) => <DrillCard key={d.id} drill={d} />)}
          </div>
        </section>
      )}
      {videos.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Відео: {area.name.toLowerCase()}</h2>
            <Link className="small" to={`/videos?area=${area.id}`}>Усі відео напряму →</Link>
          </div>
          <VideoGrid videos={videos.slice(0, 6)} />
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
  const videos = videosForTopic(area.id, topic.id);

  return (
    <div style={{ ['--area' as string]: area.color, maxWidth: 820 }}>
      <div className="breadcrumbs">
        <Link to="/learn">Навчання</Link> / <Link to={`/learn/${area.id}`}>{area.name}</Link> / {topic.title}
      </div>
      <div className="row" style={{ marginBottom: 6 }}>
        <h1 style={{ margin: 0 }}>{topic.title}</h1>
        <LevelBadge level={topic.level} />
      </div>
      <p className="lead">{topic.summary}</p>

      <section className="card section">
        <h2>Ключові моменти</h2>
        <ul className="keypoints" style={{ marginBottom: 0 }}>
          {topic.keyPoints.map((k) => <li key={k}>{k}</li>)}
        </ul>
      </section>

      {topic.mistakes && topic.mistakes.length > 0 && (
        <section className="card">
          <h2>Типові помилки</h2>
          {topic.mistakes.map((m) => (
            <div key={m.mistake} className="mistake">
              <div><strong>{m.mistake}</strong></div>
              <div className="fix"><strong>Як виправити:</strong> {m.fix}</div>
            </div>
          ))}
        </section>
      )}

      {topic.cues && topic.cues.length > 0 && (
        <section className="card">
          <h2>Підказки на корт</h2>
          <p className="small muted">Короткі фрази, які варто казати собі під час гри.</p>
          <div className="cues">{topic.cues.map((c) => <span key={c} className="cue">{c}</span>)}</div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="section">
          <h2>Подивіться, як це роблять</h2>
          <VideoGrid videos={videos} />
          <SubtitlesTip />
        </section>
      )}

      {drills.length > 0 && (
        <section className="section">
          <h2>Відпрацюйте</h2>
          <div className="grid">{drills.map((d) => <DrillCard key={d.id} drill={d} />)}</div>
        </section>
      )}

      <nav className="row section" aria-label="Навігація темами">
        {prev && <Link className="btn" to={`/learn/${area.id}/${prev.id}`}>← {prev.title}</Link>}
        <span className="spacer" />
        {next && <Link className="btn" to={`/learn/${area.id}/${next.id}`}>{next.title} →</Link>}
      </nav>
    </div>
  );
}
