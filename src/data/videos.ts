import db from './videos.json';
import type { AreaId, Level } from './types';

// Відео лежать у videos.json, щоб окремий процес (scripts/videos.mjs або інший) міг додавати й перевіряти їх
// без зміни коду. Формат описано у videos.schema.json.

export type VideoKind = 'lesson' | 'drill' | 'session' | 'howto' | 'analysis' | 'match' | 'fun';
export type FunTag = 'tricks' | 'rallies' | 'fails' | 'legend' | 'olympics';

export interface Video {
  id: string;
  youtubeId?: string;
  playlistId?: string;
  start?: number;
  query?: string;
  title: string;
  originalTitle?: string;
  channel?: string;
  kind: VideoKind;
  lang: string;
  level?: Level;
  areas: AreaId[];
  topics?: string[];
  drills?: string[];
  tags?: FunTag[];
  note: string;
  status?: 'ok' | 'unavailable' | 'not-embeddable' | 'auto';
  checkedAt?: string;
}

export interface VideoCollection {
  id: string;
  title: string;
  description: string;
  level?: Level;
  videoIds: string[];
}

export const KIND_LABEL: Record<VideoKind, string> = {
  lesson: 'Урок',
  drill: 'Вправа',
  session: 'Тренування',
  howto: 'Порада',
  analysis: 'Розбір',
  match: 'Матч',
  fun: 'Цікаве',
};

export const KIND_PLURAL: Record<VideoKind, string> = {
  lesson: 'Уроки техніки',
  drill: 'Вправи',
  session: 'Тренування',
  howto: 'Поради',
  analysis: 'Розбори',
  match: 'Матчі',
  fun: 'Цікаве',
};

export const FUN_SECTIONS: { tag: FunTag; title: string; text: string }[] = [
  { tag: 'tricks', title: 'Трюки й неймовірні удари', text: 'Удари, які не варто пробувати в лізі, але дуже хочеться.' },
  { tag: 'rallies', title: 'Найкращі розіграші', text: 'Довгі, напружені й красиві розіграші профі.' },
  { tag: 'legend', title: 'Легендарні матчі', text: 'Матчі, які варто подивитися повністю хоча б раз.' },
  { tag: 'fails', title: 'Курйози й провали', text: 'Профі теж помиляються, і це смішно.' },
  { tag: 'olympics', title: 'Сквош і Олімпіада', text: 'Сквош дебютує на Олімпійських іграх 2028 року.' },
];

const LANG_LABEL: Record<string, string> = { en: 'англійською', uk: 'українською' };
export const langLabel = (lang: string) => LANG_LABEL[lang] ?? lang;

// Записи, які скрипт перевірки позначив як недоступні, не показуємо.
const visible = (v: Video) => !v.status || v.status === 'ok' || v.status === 'auto';

export const VIDEOS: Video[] = (db.videos as Video[]).filter(visible);
export const VIDEO_BY_ID = Object.fromEntries(VIDEOS.map((v) => [v.id, v])) as Record<string, Video>;

export const COLLECTIONS: VideoCollection[] = (db.collections as VideoCollection[])
  .map((c) => ({ ...c, videoIds: c.videoIds.filter((id) => id in VIDEO_BY_ID) }))
  .filter((c) => c.videoIds.length > 0);
export const COLLECTION_BY_ID = Object.fromEntries(COLLECTIONS.map((c) => [c.id, c])) as Record<string, VideoCollection>;

export const videosForTopic = (areaId: string, topicId: string) =>
  VIDEOS.filter((v) => v.topics?.includes(`${areaId}/${topicId}`));
export const videosForDrill = (drillId: string) => VIDEOS.filter((v) => v.drills?.includes(drillId));
export const videosForArea = (areaId: AreaId) => VIDEOS.filter((v) => v.kind !== 'fun' && v.areas.includes(areaId));
export const collectionsWith = (videoId: string) => COLLECTIONS.filter((c) => c.videoIds.includes(videoId));

/** Відео можна вбудувати, якщо відомий youtubeId або playlistId. Інакше показуємо посилання на пошук. */
export const isEmbeddable = (v: Video) => Boolean(v.youtubeId || v.playlistId);

export function watchUrl(v: Video) {
  if (v.youtubeId) return `https://www.youtube.com/watch?v=${v.youtubeId}${v.start ? `&t=${v.start}s` : ''}`;
  if (v.playlistId) return `https://www.youtube.com/playlist?list=${v.playlistId}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(v.query ?? v.title)}`;
}

// youtube-nocookie.com: YouTube не ставить cookies, доки людина не почне дивитися.
export function embedUrl(v: Video, autoplay = true) {
  const params = new URLSearchParams({ rel: '0', modestbranding: '1', hl: 'uk', cc_lang_pref: 'uk' });
  if (autoplay) params.set('autoplay', '1');
  if (v.start) params.set('start', String(v.start));
  if (v.youtubeId) return `https://www.youtube-nocookie.com/embed/${v.youtubeId}?${params}`;
  if (v.playlistId) {
    params.set('list', v.playlistId);
    return `https://www.youtube-nocookie.com/embed/videoseries?${params}`;
  }
  return null;
}

export const thumbUrl = (v: Video) => (v.youtubeId ? `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg` : null);
