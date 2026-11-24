import { useCallback, useEffect, useRef, useState } from 'react';
import { Court, SPOTS, type CourtSpot } from '../components/Court';
import { STORE_KEYS, useStored } from '../lib/storage';

interface Settings {
  rounds: number;
  work: number;
  rest: number;
  pace: number; // seconds between calls
  spots: CourtSpot[];
  voice: boolean;
  beep: boolean;
}

const DEFAULTS: Settings = { rounds: 8, work: 30, rest: 30, pace: 3.5, spots: ['FL', 'FR', 'ML', 'MR', 'BL', 'BR'], voice: true, beep: true };

const PRESETS: { name: string; s: Partial<Settings> }[] = [
  { name: 'Beginner', s: { rounds: 6, work: 20, rest: 40, pace: 5 } },
  { name: 'Club', s: { rounds: 8, work: 30, rest: 30, pace: 3.5 } },
  { name: 'Hard', s: { rounds: 10, work: 45, rest: 30, pace: 2.8 } },
  { name: 'Front–back', s: { spots: ['FL', 'FR', 'BL', 'BR'] } },
];

type Phase = 'idle' | 'countdown' | 'work' | 'rest' | 'done';

interface Engine {
  phase: Phase;
  round: number;
  phaseEnds: number;
  nextCall: number;
  target: CourtSpot | null;
  reps: number;
  pausedLeft: number | null;
  pausedCall: number | null;
}

const fresh = (): Engine => ({ phase: 'idle', round: 0, phaseEnds: 0, nextCall: 0, target: null, reps: 0, pausedLeft: null, pausedCall: null });

export function Ghosting() {
  const [stored, setSettings] = useStored<Settings>(STORE_KEYS.ghosting, DEFAULTS);
  const settings = { ...DEFAULTS, ...stored };
  const eng = useRef<Engine>(fresh());
  const [, force] = useState(0);
  const audio = useRef<AudioContext | null>(null);
  const wake = useRef<{ release: () => Promise<void> } | null>(null);
  const sRef = useRef(settings);
  sRef.current = settings;

  const beep = useCallback((freq = 880, ms = 120) => {
    if (!sRef.current.beep || !audio.current) return;
    try {
      const ctx = audio.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.25, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + ms / 1000);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + ms / 1000);
    } catch { /* audio unavailable */ }
  }, []);

  const say = useCallback((text: string) => {
    if (!sRef.current.voice || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.15;
      window.speechSynthesis.speak(u);
    } catch { /* speech unavailable */ }
  }, []);

  const pick = useCallback((prev: CourtSpot | null): CourtSpot => {
    const pool = sRef.current.spots.length ? sRef.current.spots : DEFAULTS.spots;
    const options = pool.length > 1 ? pool.filter((p) => p !== prev) : pool;
    return options[Math.floor(Math.random() * options.length)];
  }, []);

  const releaseWake = () => {
    wake.current?.release().catch(() => {});
    wake.current = null;
  };

  // Main loop
  useEffect(() => {
    const id = window.setInterval(() => {
      const e = eng.current;
      const s = sRef.current;
      if (e.phase === 'idle' || e.phase === 'done' || e.pausedLeft != null) return;
      const now = performance.now();
      if (e.phase === 'work' && now >= e.nextCall && now < e.phaseEnds - 800) {
        e.target = pick(e.target);
        e.reps++;
        e.nextCall = now + s.pace * 1000;
        beep(990, 90);
        say(SPOTS[e.target].speech);
      }
      if (now >= e.phaseEnds) {
        if (e.phase === 'countdown') {
          e.phase = 'work';
          e.round = 1;
          e.phaseEnds = now + s.work * 1000;
          e.nextCall = now;
          beep(1200, 300);
        } else if (e.phase === 'work') {
          e.target = null;
          if (e.round >= s.rounds) {
            e.phase = 'done';
            beep(660, 600);
            say('Session complete. Well done.');
            releaseWake();
          } else {
            e.phase = 'rest';
            e.phaseEnds = now + s.rest * 1000;
            beep(500, 400);
            say('Rest');
          }
        } else if (e.phase === 'rest') {
          e.phase = 'work';
          e.round++;
          e.phaseEnds = now + s.work * 1000;
          e.nextCall = now + 600;
          beep(1200, 300);
        }
      } else if (e.phase !== 'work') {
        const left = Math.ceil((e.phaseEnds - now) / 1000);
        const prevLeft = Math.ceil((e.phaseEnds - now - 100) / 1000);
        if (left !== prevLeft && left <= 3 && left >= 1) beep(700, 80);
      }
      force((n) => n + 1);
    }, 100);
    return () => window.clearInterval(id);
  }, [beep, pick, say]);

  useEffect(() => () => { releaseWake(); try { window.speechSynthesis?.cancel(); } catch { /* noop */ } }, []);

  const start = async () => {
    try {
      audio.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      await audio.current.resume();
    } catch { audio.current = null; }
    try {
      const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
      wake.current = (await nav.wakeLock?.request('screen')) ?? null;
    } catch { /* not supported */ }
    eng.current = { ...fresh(), phase: 'countdown', phaseEnds: performance.now() + 5000 };
    say('Get ready');
    force((n) => n + 1);
  };

  const pause = () => {
    const e = eng.current;
    const now = performance.now();
    if (e.pausedLeft == null) {
      e.pausedLeft = e.phaseEnds - now;
      e.pausedCall = e.nextCall - now;
      try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    } else {
      e.phaseEnds = now + e.pausedLeft;
      e.nextCall = now + (e.pausedCall ?? 0);
      e.pausedLeft = null;
      e.pausedCall = null;
    }
    force((n) => n + 1);
  };

  const stop = () => {
    eng.current = fresh();
    releaseWake();
    try { window.speechSynthesis?.cancel(); } catch { /* noop */ }
    force((n) => n + 1);
  };

  const e = eng.current;
  const running = e.phase !== 'idle' && e.phase !== 'done';
  const left = e.pausedLeft != null ? e.pausedLeft : Math.max(0, e.phaseEnds - performance.now());
  const secs = Math.ceil(left / 1000);
  const totalMin = Math.round((settings.rounds * settings.work + (settings.rounds - 1) * settings.rest) / 60);

  const update = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch });
  const toggleSpot = (k: CourtSpot) =>
    update({ spots: settings.spots.includes(k) ? settings.spots.filter((x) => x !== k) : [...settings.spots, k] });

  return (
    <div>
      <h1>Ghosting trainer</h1>
      <p className="lead">Random corner calls with voice and beeps. Move from the T, play a shadow swing, recover. Prop your phone up at the front of the court.</p>

      <div className="ghost-stage section">
        <div className="card">
          <Court className="ghost-court" target={e.phase === 'work' ? e.target : null} enabled={settings.spots} />
        </div>
        <div className="card stack">
          <div className={`ghost-phase ${e.phase}`}>
            {e.phase === 'idle' && 'Ready'}
            {e.phase === 'countdown' && 'Get ready'}
            {e.phase === 'work' && `Work · round ${e.round} / ${settings.rounds}`}
            {e.phase === 'rest' && `Rest · next round ${e.round + 1} / ${settings.rounds}`}
            {e.phase === 'done' && 'Done!'}
            {e.pausedLeft != null && ' · paused'}
          </div>
          <div className="ghost-time" aria-live="off">{running ? secs : e.phase === 'done' ? '✓' : `${totalMin}′`}</div>
          <div className="ghost-call" aria-live="assertive">{e.phase === 'work' && e.target ? SPOTS[e.target].label : e.phase === 'rest' ? 'Breathe' : ''}</div>
          <div className="row" style={{ justifyContent: 'center' }}>
            {!running ? (
              <button className="btn primary big" onClick={start}>{e.phase === 'done' ? 'Go again' : 'Start'}</button>
            ) : (
              <>
                <button className="btn big" onClick={pause}>{e.pausedLeft != null ? 'Resume' : 'Pause'}</button>
                <button className="btn big danger" onClick={stop}>Stop</button>
              </>
            )}
          </div>
          {(running || e.phase === 'done') && <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>{e.reps} movement{e.reps === 1 ? '' : 's'} called</p>}
        </div>
      </div>

      <section className="card section stack" aria-disabled={running} style={{ opacity: running ? 0.55 : 1, pointerEvents: running ? 'none' : undefined }}>
        <h2 style={{ margin: 0 }}>Settings</h2>
        <div className="row">
          {PRESETS.map((p) => <button key={p.name} className="chip" onClick={() => update(p.s)}>{p.name}</button>)}
          <button className="chip" onClick={() => setSettings(DEFAULTS)}>Reset</button>
        </div>
        <div className="grid">
          <label className="field">Rounds: {settings.rounds}
            <input type="range" min={1} max={20} value={settings.rounds} onChange={(ev) => update({ rounds: +ev.target.value })} />
          </label>
          <label className="field">Work: {settings.work}s
            <input type="range" min={10} max={120} step={5} value={settings.work} onChange={(ev) => update({ work: +ev.target.value })} />
          </label>
          <label className="field">Rest: {settings.rest}s
            <input type="range" min={10} max={120} step={5} value={settings.rest} onChange={(ev) => update({ rest: +ev.target.value })} />
          </label>
          <label className="field">Call every {settings.pace.toFixed(1)}s
            <input type="range" min={2} max={8} step={0.1} value={settings.pace} onChange={(ev) => update({ pace: +ev.target.value })} />
          </label>
        </div>
        <div>
          <div className="small muted" style={{ fontWeight: 600, marginBottom: 6 }}>Positions</div>
          <div className="row">
            {(Object.keys(SPOTS) as CourtSpot[]).map((k) => (
              <button key={k} className="chip" aria-pressed={settings.spots.includes(k)} onClick={() => toggleSpot(k)}>{SPOTS[k].label}</button>
            ))}
          </div>
        </div>
        <div className="row">
          <button className="chip" aria-pressed={settings.voice} onClick={() => update({ voice: !settings.voice })}>Voice calls</button>
          <button className="chip" aria-pressed={settings.beep} onClick={() => update({ beep: !settings.beep })}>Beeps</button>
        </div>
        <p className="small muted" style={{ margin: 0 }}>Total ≈ {totalMin} min. Tip: start slower than you think — quality movement matters more than speed.</p>
      </section>
    </div>
  );
}
