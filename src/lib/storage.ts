import { useCallback, useEffect, useState } from 'react';

// Everything personal lives only in this browser. No accounts, no server.
const PREFIX = 'squash-trainer:';

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode, quota) — app keeps working in memory */
  }
}

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStore(key, fallback));
  useEffect(() => {
    writeStore(key, value);
  }, [key, value]);
  const update = useCallback((v: T | ((prev: T) => T)) => setValue(v), []);
  return [value, update] as const;
}

export const STORE_KEYS = {
  assessments: 'assessments',
  log: 'log',
  ghosting: 'ghosting-settings',
  favorites: 'favorite-drills',
  quizBest: 'quiz-best',
} as const;

export function exportAll(): string {
  const out: Record<string, unknown> = {};
  for (const k of Object.values(STORE_KEYS)) out[k] = readStore(k, null);
  return JSON.stringify({ app: 'squash-trainer', version: 1, exportedAt: new Date().toISOString(), data: out }, null, 2);
}

export function importAll(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (parsed?.app !== 'squash-trainer' || typeof parsed.data !== 'object') return false;
    for (const k of Object.values(STORE_KEYS)) {
      if (parsed.data[k] != null) writeStore(k, parsed.data[k]);
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAll() {
  for (const k of Object.values(STORE_KEYS)) {
    try {
      localStorage.removeItem(PREFIX + k);
    } catch {
      /* ignore */
    }
  }
}
