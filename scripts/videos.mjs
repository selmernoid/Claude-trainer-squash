#!/usr/bin/env node
// Maintenance tool for src/data/videos.json — the portal's video database.
//
//   npm run videos:validate            check structure and cross-references (offline, used in CI)
//   npm run videos:check               ask YouTube (oEmbed, no key) whether each video still exists and can be embedded;
//                                      fills channel/originalTitle, sets status + checkedAt
//   npm run videos:resolve             for entries that only have a `query`, search YouTube Data API v3 and fill youtubeId
//                                      (needs YOUTUBE_API_KEY; found entries get status "auto" until a human reviews them)
//
// Options: --dry-run (print changes, don't write), --only=<id,id> (limit to these entries), --stale-days=N (check: skip
// entries checked in the last N days, default 0).
//
// Run with: node --experimental-strip-types scripts/videos.mjs <command>   (the npm scripts already do this)

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB_PATH = path.join(root, 'src/data/videos.json');

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith('--')) ?? 'validate';
const flag = (name) => args.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const flagValue = (name) => flag(name)?.split('=')[1];
const dryRun = Boolean(flag('dry-run'));
const only = flagValue('only')?.split(',');

const KINDS = ['lesson', 'drill', 'session', 'howto', 'analysis', 'match', 'fun'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const TAGS = ['tricks', 'rallies', 'fails', 'legend', 'olympics'];
const STATUSES = ['ok', 'unavailable', 'not-embeddable', 'auto'];
const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const today = () => new Date().toISOString().slice(0, 10);

async function loadDb() {
  return JSON.parse(await readFile(DB_PATH, 'utf8'));
}

async function saveDb(db) {
  if (dryRun) {
    console.log('(dry run: videos.json not written)');
    return;
  }
  await writeFile(DB_PATH, JSON.stringify(db, null, 2) + '\n');
  console.log(`Wrote ${path.relative(root, DB_PATH)}`);
}

// ---------- validate ----------

async function validate() {
  const db = await loadDb();
  const { AREAS } = await import(path.join(root, 'src/data/areas.ts'));
  const { DRILLS } = await import(path.join(root, 'src/data/drills.ts'));
  const areaIds = new Set(AREAS.map((a) => a.id));
  const topicIds = new Set(AREAS.flatMap((a) => a.topics.map((t) => `${a.id}/${t.id}`)));
  const drillIds = new Set(DRILLS.map((d) => d.id));

  const errors = [];
  const err = (where, msg) => errors.push(`${where}: ${msg}`);
  if (db.version !== 1) err('root', 'version must be 1');

  const ids = new Set();
  const ytIds = new Map();
  for (const [i, v] of (db.videos ?? []).entries()) {
    const at = `videos[${i}] ${v.id ?? '?'}`;
    if (!v.id || !SLUG.test(v.id)) err(at, 'id must be a lowercase slug');
    if (ids.has(v.id)) err(at, 'duplicate id');
    ids.add(v.id);
    if (!v.title) err(at, 'title is required');
    if (!v.note) err(at, 'note is required');
    if (!v.lang) err(at, 'lang is required');
    if (!KINDS.includes(v.kind)) err(at, `kind must be one of ${KINDS.join(', ')}`);
    if (v.level && !LEVELS.includes(v.level)) err(at, `unknown level ${v.level}`);
    if (v.status && !STATUSES.includes(v.status)) err(at, `unknown status ${v.status}`);
    if (!v.youtubeId && !v.playlistId && !v.query) err(at, 'needs youtubeId, playlistId or query');
    if (v.youtubeId) {
      if (!YT_ID.test(v.youtubeId)) err(at, `youtubeId "${v.youtubeId}" is not 11 characters of [A-Za-z0-9_-]`);
      if (ytIds.has(v.youtubeId)) err(at, `same youtubeId as ${ytIds.get(v.youtubeId)}`);
      ytIds.set(v.youtubeId, v.id);
    }
    if (!Array.isArray(v.areas)) err(at, 'areas must be an array');
    for (const a of v.areas ?? []) if (!areaIds.has(a)) err(at, `unknown area "${a}"`);
    for (const t of v.topics ?? []) if (!topicIds.has(t)) err(at, `unknown topic "${t}"`);
    for (const d of v.drills ?? []) if (!drillIds.has(d)) err(at, `unknown drill "${d}"`);
    for (const t of v.tags ?? []) if (!TAGS.includes(t)) err(at, `unknown tag "${t}"`);
    if (v.kind === 'fun' && !v.tags?.length) err(at, 'fun videos need at least one tag so they appear on the «Цікаве» page');
  }

  const cids = new Set();
  for (const [i, c] of (db.collections ?? []).entries()) {
    const at = `collections[${i}] ${c.id ?? '?'}`;
    if (!c.id || !SLUG.test(c.id)) err(at, 'id must be a lowercase slug');
    if (cids.has(c.id)) err(at, 'duplicate id');
    cids.add(c.id);
    if (!c.title || !c.description) err(at, 'title and description are required');
    if (!c.videoIds?.length) err(at, 'videoIds must not be empty');
    for (const id of c.videoIds ?? []) if (!ids.has(id)) err(at, `unknown video "${id}"`);
  }

  const total = db.videos.length;
  const pending = db.videos.filter((v) => !v.youtubeId && !v.playlistId).length;
  const hidden = db.videos.filter((v) => v.status === 'unavailable' || v.status === 'not-embeddable').length;
  if (errors.length) {
    console.error(`videos.json has ${errors.length} problem(s):\n  ${errors.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`videos.json OK: ${total} videos (${pending} waiting for a YouTube id, ${hidden} hidden), ${db.collections.length} collections.`);
}

// ---------- check (oEmbed) ----------

async function oembed(v) {
  const url = v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : `https://www.youtube.com/playlist?list=${v.playlistId}`;
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
  if (res.ok) return { status: 'ok', info: await res.json() };
  // oEmbed answers 401/403 for videos whose owner disabled embedding, 404/400 for removed or private ones.
  if (res.status === 401 || res.status === 403) return { status: 'not-embeddable' };
  if (res.status === 404 || res.status === 400) return { status: 'unavailable' };
  throw new Error(`HTTP ${res.status}`);
}

async function check() {
  const db = await loadDb();
  const staleDays = Number(flagValue('stale-days') ?? 0);
  const cutoff = Date.now() - staleDays * 86_400_000;
  const todo = db.videos.filter(
    (v) => (v.youtubeId || v.playlistId) && (!only || only.includes(v.id)) && (!v.checkedAt || Date.parse(v.checkedAt) < cutoff),
  );
  console.log(`Checking ${todo.length} video(s)…`);
  let changed = 0;
  let failed = 0;
  const queue = [...todo];
  const worker = async () => {
    for (let v = queue.shift(); v; v = queue.shift()) {
      try {
        const { status, info } = await oembed(v);
        const before = JSON.stringify(v);
        // Keep "auto" until a human has looked at it, unless the video is gone.
        v.status = v.status === 'auto' && status === 'ok' ? 'auto' : status;
        if (info?.author_name) v.channel = info.author_name;
        if (info?.title) v.originalTitle = info.title;
        v.checkedAt = today();
        if (JSON.stringify(v) !== before) changed++;
        if (status !== 'ok') console.log(`  ${v.id}: ${status}`);
      } catch (e) {
        failed++;
        console.warn(`  ${v.id}: could not check (${e.message})`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(`${changed} updated, ${failed} failed.`);
  if (failed === todo.length && todo.length) {
    console.error('Every request failed — is youtube.com reachable from here?');
    process.exit(1);
  }
  if (changed) await saveDb(db);
}

// ---------- resolve (YouTube Data API v3) ----------

async function resolve() {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.error('Set YOUTUBE_API_KEY (YouTube Data API v3) to resolve queries.');
    process.exit(1);
  }
  const db = await loadDb();
  const known = new Set(db.videos.map((v) => v.youtubeId).filter(Boolean));
  const todo = db.videos.filter((v) => !v.youtubeId && !v.playlistId && v.query && (!only || only.includes(v.id)));
  console.log(`Resolving ${todo.length} queries…`);
  let found = 0;
  for (const v of todo) {
    const params = new URLSearchParams({
      part: 'snippet',
      type: 'video',
      videoEmbeddable: 'true',
      maxResults: '5',
      q: v.query,
      key,
    });
    if (v.lang) params.set('relevanceLanguage', v.lang);
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    if (!res.ok) {
      console.warn(`  ${v.id}: HTTP ${res.status} ${await res.text()}`);
      continue;
    }
    const items = (await res.json()).items ?? [];
    const hit = items.find((it) => it.id?.videoId && !known.has(it.id.videoId));
    if (!hit) {
      console.log(`  ${v.id}: nothing new for “${v.query}”`);
      continue;
    }
    v.youtubeId = hit.id.videoId;
    v.originalTitle = hit.snippet.title;
    v.channel = hit.snippet.channelTitle;
    v.status = 'auto';
    v.checkedAt = today();
    known.add(v.youtubeId);
    found++;
    console.log(`  ${v.id}: ${v.youtubeId} “${v.originalTitle}” (${v.channel})`);
  }
  console.log(`${found} resolved. Review entries with status "auto", then set status to "ok".`);
  if (found) await saveDb(db);
}

const commands = { validate, check, resolve };
if (!commands[command]) {
  console.error(`Unknown command "${command}". Use: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}
await commands[command]();
