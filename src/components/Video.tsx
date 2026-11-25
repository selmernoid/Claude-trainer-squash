import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LEVEL_LABEL } from '../data/types';
import { embedUrl, isEmbeddable, KIND_LABEL, langLabel, thumbUrl, watchUrl, type Video } from '../data/videos';
import { pauseOthers, registerPlayer } from '../lib/youtubeSync';

interface PlayerProps {
  video: Video;
  big?: boolean;
  /** Одразу показати плеєр (наприклад, на сторінці відео після переходу з набору). */
  autoload?: boolean;
}

// «Легке» вбудовування: до натискання показуємо лише обкладинку, тому YouTube не завантажується
// (і не відстежує), доки людина сама не захоче дивитися.
export function VideoPlayer({ video, big, autoload }: PlayerProps) {
  const [on, setOn] = useState(Boolean(autoload));
  useEffect(() => setOn(Boolean(autoload)), [video.id, autoload]);
  const frame = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!on || !frame.current) return;
    const unregister = registerPlayer(frame.current);
    pauseOthers(frame.current); // новий плеєр стартує з автозапуском: решту одразу на паузу
    return unregister;
  }, [on, video.id]);
  const src = embedUrl(video);
  const thumb = thumbUrl(video);

  if (!isEmbeddable(video) || !src) {
    return (
      <div className={`player${big ? ' big' : ''}`}>
        <div className="player-search">
          <div>
            <p>Конкретне відео ще не підібрано.</p>
            <a className="btn primary" href={watchUrl(video)} target="_blank" rel="noopener noreferrer">
              Шукати на YouTube ↗
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`player${big ? ' big' : ''}`}>
      {on ? (
        <iframe
          ref={frame}
          src={src}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className="player-cover" onClick={() => setOn(true)} aria-label={`Дивитися: ${video.title}`}>
          {thumb && <img src={thumb} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
          <span className="play" aria-hidden />
          {video.playlistId && !video.youtubeId && <span className="label">Плейлист</span>}
        </button>
      )}
    </div>
  );
}

export function VideoMeta({ video }: { video: Video }) {
  return (
    <div className="video-meta">
      <span className="badge">{KIND_LABEL[video.kind]}</span>
      {video.level && <span className={`badge ${video.level}`}>{LEVEL_LABEL[video.level]}</span>}
      <span>{langLabel(video.lang)}</span>
      {video.channel && <span>· {video.channel}</span>}
    </div>
  );
}

export function VideoCard({ video }: { video: Video }) {
  return (
    <article className="card video-card">
      <VideoPlayer video={video} />
      <div className="video-body">
        <h3><Link to={`/videos/${video.id}`}>{video.title}</Link></h3>
        <VideoMeta video={video} />
        <p className="small muted" style={{ margin: 0 }}>{video.note}</p>
      </div>
    </article>
  );
}

export function VideoGrid({ videos }: { videos: Video[] }) {
  return <div className="grid">{videos.map((v) => <VideoCard key={v.id} video={v} />)}</div>;
}

/** Мініатюра YouTube, що ховається, якщо не завантажилася. */
export function Thumb({ src }: { src: string }) {
  return <img src={src} alt="" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />;
}

export function SubtitlesTip() {
  return (
    <p className="small muted">
      Більшість відео англійською. Щоб увімкнути українські субтитри, натисніть у плеєрі ⚙ → «Субтитри» → «Автоматичний переклад» → «Українська».
    </p>
  );
}
