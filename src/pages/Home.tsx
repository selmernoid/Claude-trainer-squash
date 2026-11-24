import { Link } from 'react-router-dom';
import { ALL_TOPICS, AREAS } from '../data/areas';
import { Court } from '../components/Court';
import { readStore, STORE_KEYS } from '../lib/storage';
import type { SavedAssessment } from './Assess';
import { lowestAreas } from './Assess';

function tipOfTheDay() {
  const tips = ALL_TOPICS.flatMap(({ area, topic }) => topic.keyPoints.map((tip) => ({ area, topic, tip })));
  const day = Math.floor(Date.now() / 86_400_000);
  return tips[day % tips.length];
}

const TOOLS = [
  { to: '/assess', title: 'Self-assessment', text: 'Rate 17 skills in 3 minutes and get your weakest areas with a plan.' },
  { to: '/plan', title: 'Session builder', text: 'Generate a solo, pairs or group session for the time you have.' },
  { to: '/ghosting', title: 'Ghosting trainer', text: 'Random corner calls with voice, timed work and rest rounds.' },
  { to: '/log', title: 'Practice log', text: 'Record sessions and matches, see your training trends.' },
  { to: '/quiz', title: 'Rules quiz', text: 'Let, stroke or no let? Test yourself on real scenarios.' },
  { to: '/drills', title: 'Drill library', text: 'Solo, pairs and group drills filtered by area and level.' },
];

export function Home() {
  const tip = tipOfTheDay();
  const history = readStore<SavedAssessment[]>(STORE_KEYS.assessments, []);
  const last = history[history.length - 1];
  const focus = last ? lowestAreas(last.answers, 3) : [];

  return (
    <div>
      <section className="hero">
        <Court className="court-deco" decorative />
        <h1>Get better at squash, one area at a time.</h1>
        <p>
          Technique, movement, tactics, fitness and the mental game — practical guides, drills and training tools.
          No sign-up: everything you save stays on your device.
        </p>
        <div className="row" style={{ marginTop: 18 }}>
          <Link className="btn primary big" to={last ? '/plan' : '/assess'}>
            {last ? 'Build today\'s session' : 'Find my weak spots'}
          </Link>
          <Link className="btn big" to="/learn">Browse topics</Link>
        </div>
      </section>

      {last && focus.length > 0 && (
        <section className="section card">
          <div className="section-head">
            <h2>Your current focus</h2>
            <Link to="/assess" className="small">Retake assessment</Link>
          </div>
          <p className="muted small">From your self-assessment on {new Date(last.date).toLocaleDateString()}.</p>
          <div className="row">
            {focus.map((a) => (
              <Link key={a.id} to={`/learn/${a.id}`} className="btn" style={{ borderLeft: `4px solid ${a.color}` }}>
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>What do you want to improve?</h2>
          <Link to="/learn" className="small">All topics →</Link>
        </div>
        <div className="grid">
          {AREAS.map((a) => (
            <Link key={a.id} to={`/learn/${a.id}`} className="card area-card" style={{ ['--area' as string]: a.color }}>
              <h3>{a.name}</h3>
              <p>{a.tagline}</p>
              <div className="count">{a.topics.length} topics</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section grid-2">
        <div className="card" style={{ ['--area' as string]: tip.area.color, borderLeft: `4px solid ${tip.area.color}` }}>
          <div className="small muted" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tip of the day</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: '8px 0' }}>{tip.tip}</p>
          <Link className="small" to={`/learn/${tip.area.id}/${tip.topic.id}`}>From “{tip.topic.title}” →</Link>
        </div>
        <div className="card">
          <h3>New to squash?</h3>
          <ol className="small" style={{ marginBottom: 0 }}>
            <li><Link to="/learn/technique/grip-ready">Get the grip right</Link></li>
            <li><Link to="/learn/movement/t-position">Learn to use the T</Link></li>
            <li><Link to="/learn/tactics/length-width">Hit for length and width</Link></li>
            <li><Link to="/learn/rules/scoring">Understand scoring</Link> and <Link to="/learn/rules/etiquette-safety">safety</Link></li>
            <li><Link to="/learn/gear/balls">Pick the right ball</Link></li>
          </ol>
        </div>
      </section>

      <section className="section">
        <h2>Training tools</h2>
        <div className="grid">
          {TOOLS.map((t) => (
            <Link key={t.to} to={t.to} className="card area-card">
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
