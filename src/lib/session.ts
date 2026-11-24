import { DRILLS, DRILL_BY_ID } from '../data/drills';
import type { AreaId, Drill, Level, Players } from '../data/types';
import { levelRank } from '../data/types';

export interface SessionOptions {
  minutes: number;
  players: Players;
  level: Level;
  focus: AreaId[];
  seed: number;
}

export interface SessionBlock {
  label: string;
  drill: Drill;
  minutes: number;
}

// Small deterministic PRNG so "shuffle" is reproducible per seed.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function suitsPlayers(d: Drill, p: Players) {
  // Pair drills work for a group too (rotate in and out).
  if (p === 'group') return d.players.includes('group') || d.players.includes('pairs');
  return d.players.includes(p);
}

function suitsLevel(d: Drill, level: Level) {
  const diff = levelRank(level) - levelRank(d.level);
  return diff >= 0 && diff <= 1; // at your level or one below
}

const NOT_MAIN = new Set(['dynamic-warmup', 'video-review', 'off-court-circuit', 'referee-a-match']);

export function buildSession(o: SessionOptions): SessionBlock[] {
  const rand = mulberry32(o.seed);
  const shuffle = <T,>(arr: T[]) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const blocks: SessionBlock[] = [];
  const warm = DRILL_BY_ID['dynamic-warmup'];
  const warmMin = o.minutes >= 60 ? 8 : 5;
  blocks.push({ label: 'Warm-up', drill: warm, minutes: warmMin });

  const coolMin = o.minutes >= 45 ? 5 : 3;
  let remaining = o.minutes - warmMin - coolMin;

  const pool = DRILLS.filter((d) => !NOT_MAIN.has(d.id) && suitsPlayers(d, o.players) && suitsLevel(d, o.level));
  const focus = o.focus.length ? o.focus : (['technique', 'movement', 'tactics'] as AreaId[]);
  const focused = shuffle(pool.filter((d) => d.areas.some((a) => focus.includes(a))));
  const others = shuffle(pool.filter((d) => !focused.includes(d)));

  // Finish with a game (pairs/group) or a movement/fitness block (solo) when there is time.
  const finisher = (() => {
    const games = o.players === 'solo'
      ? pool.filter((d) => d.areas.includes('fitness') || d.areas.includes('movement'))
      : pool.filter((d) => /game|winner/i.test(d.name));
    // Keep at least 15 minutes for focus work.
    return shuffle(games).find((d) => !focused.slice(0, 3).includes(d) && remaining - d.minutes >= 15);
  })();
  if (finisher) remaining -= finisher.minutes;

  const used = new Set<string>();
  for (const d of [...focused, ...others]) {
    if (remaining < 5) break;
    if (used.has(d.id) || d.id === finisher?.id) continue;
    const mins = Math.min(d.minutes, remaining);
    if (mins < Math.min(5, d.minutes)) continue;
    blocks.push({ label: d.areas.some((a) => focus.includes(a)) ? 'Focus' : 'Support', drill: d, minutes: mins });
    used.add(d.id);
    remaining -= mins;
  }
  if (finisher) blocks.push({ label: 'Finisher', drill: finisher, minutes: finisher.minutes });
  // Spread any leftover minutes over the main blocks.
  const main = blocks.filter((b) => b.label !== 'Warm-up');
  for (let i = 0; remaining > 0 && main.length; i++, remaining--) main[i % main.length].minutes++;

  blocks.push({
    label: 'Cool-down',
    drill: {
      id: 'cool-down',
      name: 'Cool-down & stretch',
      areas: ['fitness'],
      players: ['solo', 'pairs', 'group'],
      level: 'beginner',
      minutes: coolMin,
      summary: 'Easy movement, then light stretches for calves, hips, hamstrings and back. Note one takeaway in your log.',
      steps: [],
      goal: 'Heart rate down, one lesson noted.',
    },
    minutes: coolMin,
  });
  return blocks;
}
