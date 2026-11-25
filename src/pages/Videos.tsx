import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AREAS, AREA_BY_ID, findTopic } from '../data/areas';
import { DRILL_BY_ID } from '../data/drills';
import { LEVELS, LEVEL_LABEL } from '../data/types';
import {
  COLLECTIONS,
  COLLECTION_BY_ID,
  collectionsWith,
  FUN_SECTIONS,
  KIND_PLURAL,
  VIDEOS,
  VIDEO_BY_ID,
  thumbUrl,
  watchUrl,
  type Video,
  type VideoCollection,
  type VideoKind,
} from '../data/videos';
import { SubtitlesTip, Thumb, VideoGrid, VideoMeta, VideoPlayer } from '../components/Video';
import { count } from '../lib/uk';
import { NotFound } from './NotFound';

const LEARNING_KINDS: VideoKind[] = ['lesson', 'drill', 'session', 'howto', 'analysis', 'match'];
const VIDEO_FORMS: [string, string, string] = ['відео', 'відео', 'відео'];

function CollectionCard({ c }: { c: VideoCollection }) {
  const thumbs = c.videoIds.map((id) => VIDEO_BY_ID[id]).map(thumbUrl).filter(Boolean).slice(0, 3) as string[];
  return (
    <Link to={`/videos/set/${c.id}`} className="card collection-card">
      {thumbs.length > 0 && (
        <div className="collection-thumbs" aria-hidden>
          {thumbs.map((t) => <Thumb key={t} src={t} />)}
        </div>
      )}
      <h3 style={{ margin: 0 }}>{c.title}</h3>
      <p className="small muted" style={{ margin: 0 }}>{c.description}</p>
      <div className="video-meta">
        <span>{count(c.videoIds.length, VIDEO_FORMS)}</span>
        {c.level && <span className={`badge ${c.level}`}>{LEVEL_LABEL[c.level]}</span>}
      </div>
    </Link>
  );
}

export function VideosIndex() {
  const [params, setParams] = useSearchParams();
  const kind = params.get('kind') ?? '';
  const area = params.get('area') ?? '';
  const level = params.get('level') ?? '';
  const q = params.get('q') ?? '';

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const toggle = (k: string, v: string, current: string) => set(k, current === v ? '' : v);
  const filtered = Boolean(kind || area || level || q);

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return VIDEOS.filter(
      (v) =>
        v.kind !== 'fun' &&
        (!kind || v.kind === kind) &&
        (!area || v.areas.includes(area as never)) &&
        (!level || v.level === level) &&
        words.every((w) => [v.title, v.note, v.originalTitle ?? '', v.channel ?? ''].join(' ').toLowerCase().includes(w)),
    );
  }, [kind, area, level, q]);

  return (
    <div>
      <h1>Відео</h1>
      <p className="lead">
        Уроки техніки, вправи, цілі тренування й розбори гри професіоналів. Натисніть на обкладинку, щоб дивитися тут же.
        Шукаєте щось для настрою? Зазирніть у розділ <Link to="/fun">«Цікаве»</Link>.
      </p>

      {!filtered && (
        <section className="section">
          <div className="section-head"><h2>Набори відео</h2></div>
          <div className="grid">{COLLECTIONS.map((c) => <CollectionCard key={c.id} c={c} />)}</div>
        </section>
      )}

      <div className="card section stack">
        <input type="search" placeholder="Знайти відео…" value={q} onChange={(e) => set('q', e.target.value)} aria-label="Знайти відео" />
        <div className="row" role="group" aria-label="Тип">
          {LEARNING_KINDS.map((k) => (
            <button key={k} className="chip" aria-pressed={kind === k} onClick={() => toggle('kind', k, kind)}>{KIND_PLURAL[k]}</button>
          ))}
        </div>
        <div className="row" role="group" aria-label="Напрям">
          {AREAS.map((a) => (
            <button key={a.id} className="chip" aria-pressed={area === a.id} onClick={() => toggle('area', a.id, area)}>{a.name}</button>
          ))}
        </div>
        <div className="row">
          <div className="row" role="group" aria-label="Рівень">
            {LEVELS.map((l) => (
              <button key={l} className="chip" aria-pressed={level === l} onClick={() => toggle('level', l, level)}>{LEVEL_LABEL[l]}</button>
            ))}
          </div>
          {filtered && <button className="btn ghost small" onClick={() => setParams({}, { replace: true })}>Скинути фільтри</button>}
        </div>
      </div>

      <p className="small muted section" style={{ marginTop: 16 }}>{count(list.length, VIDEO_FORMS)}</p>
      {list.length ? <VideoGrid videos={list} /> : <div className="empty card">Немає відео з такими фільтрами.</div>}
      <SubtitlesTip />
    </div>
  );
}

function Related({ video }: { video: Video }) {
  const topics = (video.topics ?? []).map((t) => findTopic(...(t.split('/') as [string, string]))).filter(Boolean);
  const drills = (video.drills ?? []).map((d) => DRILL_BY_ID[d]).filter(Boolean);
  const sets = collectionsWith(video.id);
  if (!topics.length && !drills.length && !sets.length) return null;
  return (
    <div className="card stack">
      {topics.length > 0 && (
        <div>
          <h3>Теми</h3>
          <div className="row">
            {topics.map((f) => (
              <Link key={f!.topic.id} className="chip" to={`/learn/${f!.area.id}/${f!.topic.id}`} style={{ borderLeft: `4px solid ${f!.area.color}` }}>
                {f!.topic.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      {drills.length > 0 && (
        <div>
          <h3>Вправи</h3>
          <div className="row">
            {drills.map((d) => <Link key={d.id} className="chip" to={`/drills?q=${encodeURIComponent(d.name)}`}>{d.name}</Link>)}
          </div>
        </div>
      )}
      {sets.length > 0 && (
        <div>
          <h3>У наборах</h3>
          <div className="row">
            {sets.map((c) => <Link key={c.id} className="chip" to={`/videos/set/${c.id}?v=${video.id}`}>{c.title}</Link>)}
          </div>
        </div>
      )}
    </div>
  );
}

function similar(video: Video, n: number) {
  const score = (v: Video) =>
    (v.topics ?? []).filter((t) => video.topics?.includes(t)).length * 3 +
    v.areas.filter((a) => video.areas.includes(a)).length +
    (v.kind === video.kind ? 1 : 0) +
    (v.tags ?? []).filter((t) => video.tags?.includes(t)).length * 2;
  return VIDEOS.filter((v) => v.id !== video.id && (video.kind === 'fun') === (v.kind === 'fun'))
    .map((v) => ({ v, s: score(v) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, n)
    .map((x) => x.v);
}

export function VideoPage() {
  const { videoId = '' } = useParams();
  const video = VIDEO_BY_ID[videoId];
  if (!video) return <NotFound />;
  const more = similar(video, 6);
  const isFun = video.kind === 'fun';

  return (
    <div>
      <div className="breadcrumbs">
        {isFun ? <Link to="/fun">Цікаве</Link> : <Link to="/videos">Відео</Link>} / {video.title}
      </div>
      <div className="video-layout">
        <div className="stack">
          <VideoPlayer video={video} big />
          <div>
            <h1 style={{ marginBottom: 6 }}>{video.title}</h1>
            <VideoMeta video={video} />
            {video.originalTitle && video.originalTitle !== video.title && (
              <p className="small muted" style={{ margin: '6px 0 0' }}>На YouTube: «{video.originalTitle}»</p>
            )}
          </div>
          <p style={{ margin: 0 }}>{video.note}</p>
          <div className="row">
            <a className="btn" href={watchUrl(video)} target="_blank" rel="noopener noreferrer">Відкрити на YouTube ↗</a>
            {video.areas.map((a) => (
              <Link key={a} className="chip" to={`/videos?area=${a}`}>{AREA_BY_ID[a].name}</Link>
            ))}
          </div>
          {video.lang !== 'uk' && <SubtitlesTip />}
        </div>
        <Related video={video} />
      </div>
      {more.length > 0 && (
        <section className="section">
          <h2>Схожі відео</h2>
          <VideoGrid videos={more} />
        </section>
      )}
    </div>
  );
}

export function CollectionPage() {
  const { setId = '' } = useParams();
  const [params, setParams] = useSearchParams();
  const c = COLLECTION_BY_ID[setId];
  if (!c) return <NotFound />;
  const videos = c.videoIds.map((id) => VIDEO_BY_ID[id]);
  const idx = Math.max(0, videos.findIndex((v) => v.id === params.get('v')));
  const current = videos[idx];
  const go = (i: number) => setParams({ v: videos[i].id }, { replace: true });
  const started = params.has('v');

  return (
    <div>
      <div className="breadcrumbs"><Link to="/videos">Відео</Link> / {c.title}</div>
      <h1>{c.title}</h1>
      <p className="lead">{c.description}</p>
      <div className="video-layout section">
        <div className="stack">
          <VideoPlayer video={current} big autoload={started} />
          <div>
            <div className="small muted">{idx + 1} з {videos.length}</div>
            <h2 style={{ margin: '2px 0 6px' }}><Link to={`/videos/${current.id}`} style={{ color: 'inherit' }}>{current.title}</Link></h2>
            <VideoMeta video={current} />
          </div>
          <p style={{ margin: 0 }}>{current.note}</p>
          <div className="row">
            <button className="btn" disabled={idx === 0} onClick={() => go(idx - 1)}>← Попереднє</button>
            <span className="spacer" />
            <button className="btn primary" disabled={idx === videos.length - 1} onClick={() => go(idx + 1)}>Наступне →</button>
          </div>
          <SubtitlesTip />
        </div>
        <ol className="playlist card" style={{ padding: 8 }}>
          {videos.map((v, i) => {
            const t = thumbUrl(v);
            return (
              <li key={v.id}>
                <a href={`#/videos/set/${c.id}?v=${v.id}`} aria-current={i === idx} onClick={(e) => { e.preventDefault(); go(i); }}>
                  <span className="num">{i + 1}</span>
                  {t ? <Thumb src={t} /> : <span className="thumb-ph" />}
                  <span className="t">{v.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function Fun() {
  const sections = FUN_SECTIONS.map((s) => ({ ...s, videos: VIDEOS.filter((v) => v.tags?.includes(s.tag)) })).filter((s) => s.videos.length);
  return (
    <div>
      <h1>Цікаве</h1>
      <p className="lead">
        Для натхнення й настрою: трюкові удари, неймовірні розіграші, легендарні матчі й курйози. Вчитися теж можна, дивлячись,
        як грають найкращі.
      </p>
      <nav className="row section" aria-label="Розділи">
        {sections.map((s) => <a key={s.tag} className="chip" href={`#fun-${s.tag}`} onClick={(e) => { e.preventDefault(); document.getElementById(`fun-${s.tag}`)?.scrollIntoView({ behavior: 'smooth' }); }}>{s.title}</a>)}
      </nav>
      {sections.map((s) => (
        <section key={s.tag} id={`fun-${s.tag}`} className="section">
          <h2>{s.title}</h2>
          <p className="muted">{s.text}</p>
          <VideoGrid videos={s.videos} />
        </section>
      ))}
    </div>
  );
}
